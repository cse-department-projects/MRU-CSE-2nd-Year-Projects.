import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.ToIntFunction;

/** FleetPilot AI v2 - agentic fleet management (pure Java, no libraries). Run: java FleetPilot.java */
public class FleetPilot {

    static class Vehicle {
        String id, driver, from, to;
        double fLat, fLon, tLat, tLon, pos;
        int health, fuel, behavior, kmToService;
        String json() {
            return "{\"id\":\"" + id + "\",\"driver\":\"" + driver + "\",\"from\":\"" + from + "\",\"to\":\"" + to
                + "\",\"fLat\":" + fLat + ",\"fLon\":" + fLon + ",\"tLat\":" + tLat + ",\"tLon\":" + tLon
                + ",\"health\":" + health + ",\"fuel\":" + fuel + ",\"behavior\":" + behavior
                + ",\"kmToService\":" + kmToService + ",\"progress\":" + (int) pos + "}";
        }
    }

    static final List<Vehicle> fleet = new ArrayList<>();
    static final Random rnd = new Random();
    static final String[] DRIVERS = {"R. Naik", "V. Kalyani", "B. Mahendar", "K. Abhinav", "S. Reddy", "T. Rao", "P. Sharma", "M. Iyer"};
    static final String[] RESERVE = {"A. Kumar", "D. Singh", "N. Prasad", "L. Devi"};
    static final Object[][] ROUTES = {
        {"Hyderabad", 17.385, 78.487, "Vijayawada", 16.506, 80.648}, {"Medchal", 17.629, 78.481, "Warangal", 17.969, 79.594},
        {"Kompally", 17.535, 78.486, "Nizamabad", 18.672, 78.094}, {"HITEC City", 17.445, 78.381, "Karimnagar", 18.438, 79.129},
        {"Secunderabad", 17.440, 78.498, "Nalgonda", 17.057, 79.267}, {"Shamshabad", 17.261, 78.381, "Adilabad", 19.664, 78.532},
        {"Kukatpally", 17.494, 78.399, "Khammam", 17.247, 80.151}, {"Uppal", 17.399, 78.559, "Nellore", 14.443, 79.987}};

    static void seed() {
        for (int i = 0; i < 8; i++) {
            Vehicle v = new Vehicle();
            Object[] r = ROUTES[i];
            v.id = "FL-" + (100 + i); v.driver = DRIVERS[i];
            v.from = (String) r[0]; v.fLat = (Double) r[1]; v.fLon = (Double) r[2];
            v.to = (String) r[3]; v.tLat = (Double) r[4]; v.tLon = (Double) r[5];
            v.health = 65 + rnd.nextInt(34); v.fuel = 35 + rnd.nextInt(61); v.behavior = 70 + rnd.nextInt(29);
            v.kmToService = 800 + rnd.nextInt(4000); v.pos = 10 + rnd.nextInt(60);
            fleet.add(v);
        }
        fleet.get(2).fuel = 12; fleet.get(5).behavior = 58; fleet.get(6).kmToService = 250; // demo problems for the agent
    }

    static Vehicle find(String id) { for (Vehicle v : fleet) if (v.id.equalsIgnoreCase(id)) return v; return null; }
    static Vehicle worst(ToIntFunction<Vehicle> f) {
        Vehicle b = null;
        for (Vehicle v : fleet) if (b == null || f.applyAsInt(v) < f.applyAsInt(b)) b = v;
        return b;
    }
    static boolean has(String m, String... keys) { for (String k : keys) if (m.contains(k)) return true; return false; }
    static String esc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n"); }

    static synchronized String allJson() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < fleet.size(); i++) { if (i > 0) sb.append(','); sb.append(fleet.get(i).json()); }
        return sb.append(']').toString();
    }

    /** Vehicles move along their route; fuel, health, service km slowly change. */
    static int tickN = 0;
    static synchronized void tick() {
        if (++tickN % 3 == 0) saveAll();
        for (Vehicle v : fleet) {
            v.pos += 0.3 + rnd.nextDouble() * 0.7;
            if (v.pos >= 100) {
                String t = v.from; v.from = v.to; v.to = t;
                double a = v.fLat, b = v.fLon; v.fLat = v.tLat; v.fLon = v.tLon; v.tLat = a; v.tLon = b;
                v.pos = 0;
            }
            if (rnd.nextInt(10) < 3) v.fuel = Math.max(3, v.fuel - 1);
            if (rnd.nextInt(25) == 0) v.health = Math.max(30, v.health - 1);
            if (rnd.nextInt(30) == 0) v.behavior = Math.max(40, v.behavior - 1);
            v.kmToService = Math.max(0, v.kmToService - rnd.nextInt(4));
        }
    }

    // ---------- MySQL (falls back to memory mode if MySQL is not reachable) ----------
    static Connection conn;
    static String dbError = "";
    static final Map<String, double[]> CITIES = new LinkedHashMap<>();
    static final List<String[]> events = new ArrayList<>();
    static {
        Object[][] c = {{"Hyderabad", 17.385, 78.487}, {"Secunderabad", 17.440, 78.498}, {"Medchal", 17.629, 78.481}, {"Kompally", 17.535, 78.486},
            {"HITEC City", 17.445, 78.381}, {"Kukatpally", 17.494, 78.399}, {"Uppal", 17.399, 78.559}, {"Shamshabad", 17.261, 78.381},
            {"Warangal", 17.969, 79.594}, {"Karimnagar", 18.438, 79.129}, {"Nizamabad", 18.672, 78.094}, {"Adilabad", 19.664, 78.532},
            {"Khammam", 17.247, 80.151}, {"Nalgonda", 17.057, 79.267}, {"Suryapet", 17.140, 79.623}, {"Siddipet", 18.101, 78.852},
            {"Ramagundam", 18.755, 79.513}, {"Mahbubnagar", 16.737, 77.987}, {"Vijayawada", 16.506, 80.648}, {"Guntur", 16.307, 80.437},
            {"Nellore", 14.443, 79.987}, {"Kurnool", 15.829, 78.037}};
        for (Object[] x : c) CITIES.put((String) x[0], new double[]{(Double) x[1], (Double) x[2]});
    }

    static void connectDb() {
        try {
            Properties p = new Properties();
            try (InputStream in = new FileInputStream("db.properties")) { p.load(in); }
            conn = DriverManager.getConnection(p.getProperty("url"), p.getProperty("user", "root"), p.getProperty("password", ""));
            try (Statement st = conn.createStatement()) {
                st.execute("CREATE TABLE IF NOT EXISTS vehicle (id VARCHAR(20) PRIMARY KEY, driver VARCHAR(60), from_city VARCHAR(40), to_city VARCHAR(40), "
                    + "f_lat DOUBLE, f_lon DOUBLE, t_lat DOUBLE, t_lon DOUBLE, pos DOUBLE, health INT, fuel INT, behavior INT, km_to_service INT)");
                for (String t : new String[]{"fuel_log", "maintenance_log", "alert_log"})
                    st.execute("CREATE TABLE IF NOT EXISTS " + t + " (id INT AUTO_INCREMENT PRIMARY KEY, vehicle_id VARCHAR(20), message VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            }
            System.out.println(" MySQL connected: data is saved in the database.");
        } catch (Throwable e) {
            conn = null; dbError = String.valueOf(e.getMessage());
            System.out.println(" MySQL NOT connected (" + dbError + ") -> running in memory mode.");
        }
    }

    static void loadFleet() {
        if (conn != null) {
            try (Statement st = conn.createStatement(); ResultSet r = st.executeQuery("SELECT * FROM vehicle ORDER BY id")) {
                while (r.next()) {
                    Vehicle v = new Vehicle();
                    v.id = r.getString("id"); v.driver = r.getString("driver"); v.from = r.getString("from_city"); v.to = r.getString("to_city");
                    v.fLat = r.getDouble("f_lat"); v.fLon = r.getDouble("f_lon"); v.tLat = r.getDouble("t_lat"); v.tLon = r.getDouble("t_lon");
                    v.pos = r.getDouble("pos"); v.health = r.getInt("health"); v.fuel = r.getInt("fuel"); v.behavior = r.getInt("behavior"); v.kmToService = r.getInt("km_to_service");
                    fleet.add(v);
                }
            } catch (Exception e) { fleet.clear(); dbError = String.valueOf(e.getMessage()); }
        }
        if (fleet.isEmpty()) { seed(); saveAll(); }
    }

    static synchronized void saveAll() {
        if (conn == null) return;
        try (PreparedStatement p = conn.prepareStatement("REPLACE INTO vehicle (id,driver,from_city,to_city,f_lat,f_lon,t_lat,t_lon,pos,health,fuel,behavior,km_to_service) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")) {
            for (Vehicle v : fleet) {
                p.setString(1, v.id); p.setString(2, v.driver); p.setString(3, v.from); p.setString(4, v.to);
                p.setDouble(5, v.fLat); p.setDouble(6, v.fLon); p.setDouble(7, v.tLat); p.setDouble(8, v.tLon); p.setDouble(9, v.pos);
                p.setInt(10, v.health); p.setInt(11, v.fuel); p.setInt(12, v.behavior); p.setInt(13, v.kmToService);
                p.addBatch();
            }
            p.executeBatch();
        } catch (Exception e) { dbError = String.valueOf(e.getMessage()); }
    }

    static void dbExec(String sql, Object... args) {
        if (conn == null) return;
        try (PreparedStatement p = conn.prepareStatement(sql)) {
            for (int i = 0; i < args.length; i++) p.setObject(i + 1, args[i]);
            p.executeUpdate();
        } catch (Exception e) { dbError = String.valueOf(e.getMessage()); }
    }

    static synchronized void logEvent(String table, String vid, String msg) {
        events.add(0, new String[]{table, vid, msg, java.time.LocalTime.now().withNano(0).toString()});
        if (events.size() > 50) events.remove(50);
        dbExec("INSERT INTO " + table + " (vehicle_id, message) VALUES (?, ?)", vid, msg);
    }

    static String logRow(String k, String v, String m, String t) {
        return "{\"table\":\"" + k + "\",\"vehicle\":\"" + esc(v) + "\",\"message\":\"" + esc(m) + "\",\"time\":\"" + esc(t) + "\"}";
    }

    static synchronized String logsJson() {
        StringBuilder sb = new StringBuilder("[");
        if (conn != null) {
            String q = "SELECT kind, vehicle_id, message, created_at FROM (SELECT 'fuel_log' AS kind, id, vehicle_id, message, created_at FROM fuel_log UNION ALL "
                + "SELECT 'maintenance_log', id, vehicle_id, message, created_at FROM maintenance_log UNION ALL "
                + "SELECT 'alert_log', id, vehicle_id, message, created_at FROM alert_log) x ORDER BY created_at DESC, id DESC LIMIT 30";
            try (Statement st = conn.createStatement(); ResultSet r = st.executeQuery(q)) {
                while (r.next()) { if (sb.length() > 1) sb.append(','); sb.append(logRow(r.getString(1), r.getString(2), r.getString(3), r.getString(4))); }
            } catch (Exception e) { dbError = String.valueOf(e.getMessage()); }
        } else {
            for (String[] e : events) { if (sb.length() > 1) sb.append(','); sb.append(logRow(e[0], e[1], e[2], e[3])); }
        }
        return sb.append(']').toString();
    }

    static synchronized String addVehicle(String driver, String from, String to) {
        driver = driver.replaceAll("[^A-Za-z0-9 .]", "").trim();
        double[] a = CITIES.get(from), b = CITIES.get(to);
        if (driver.isEmpty() || a == null || b == null || from.equals(to)) return "Enter a driver name and two different cities.";
        int max = 99;
        for (Vehicle x : fleet) max = Math.max(max, Integer.parseInt(x.id.substring(3)));
        Vehicle v = new Vehicle();
        v.id = "FL-" + (max + 1); v.driver = driver; v.from = from; v.fLat = a[0]; v.fLon = a[1]; v.to = to; v.tLat = b[0]; v.tLon = b[1];
        v.health = 95; v.fuel = 100; v.behavior = 90; v.kmToService = 5000; v.pos = 0;
        fleet.add(v); saveAll();
        return v.id + " added and saved.";
    }

    static synchronized void delVehicle(String id) {
        if (fleet.removeIf(v -> v.id.equals(id))) dbExec("DELETE FROM vehicle WHERE id = ?", id);
    }

    static synchronized void resetDemo() {
        fleet.clear(); dbExec("DELETE FROM vehicle"); seed(); saveAll();
    }

    // ---------- Auto alerts ----------
    static synchronized List<String[]> alerts() {
        List<String[]> l = new ArrayList<>();
        for (Vehicle v : fleet) {
            if (v.fuel < 20) l.add(new String[]{v.id, "fuel", v.fuel < 10 ? "critical" : "warning", "Fuel at " + v.fuel + "%", "Divert to nearest fuel stop and refuel"});
            if (v.kmToService < 400) l.add(new String[]{v.id, "service", v.kmToService < 150 ? "critical" : "warning", "Service due in " + v.kmToService + " km", "Schedule maintenance at the next depot"});
            if (v.health < 60) l.add(new String[]{v.id, "health", "critical", "Vehicle health at " + v.health + "%", "Book an inspection and reduce the load"});
            if (v.behavior < 65) l.add(new String[]{v.id, "behavior", "warning", "Driver behavior score " + v.behavior + "% (harsh braking / speeding)", "Reassign a safer driver"});
        }
        return l;
    }

    static synchronized String alertsJson() {
        StringBuilder sb = new StringBuilder("[");
        for (String[] a : alerts()) {
            if (sb.length() > 1) sb.append(',');
            sb.append("{\"vehicle\":\"" + a[0] + "\",\"type\":\"" + a[1] + "\",\"severity\":\"" + a[2] + "\",\"message\":\"" + esc(a[3]) + "\",\"suggestion\":\"" + esc(a[4]) + "\"}");
        }
        return sb.append(']').toString();
    }

    static synchronized String fix(Vehicle v, String type) {
        String r = doFix(v, type);
        logEvent(type.equals("fuel") ? "fuel_log" : type.equals("behavior") ? "alert_log" : "maintenance_log", v.id, r);
        return r;
    }

    static synchronized String doFix(Vehicle v, String type) {
        switch (type) {
            case "fuel": v.fuel = 90 + rnd.nextInt(10); return v.id + " sent to the nearest fuel stop and refueled. Fuel is now " + v.fuel + "%.";
            case "behavior": {
                String old = v.driver; v.driver = RESERVE[rnd.nextInt(RESERVE.length)]; v.behavior = 85 + rnd.nextInt(11);
                return "Reassigned " + v.id + " from " + old + " to " + v.driver + ". Behavior score is now " + v.behavior + "%.";
            }
            default: v.kmToService = 5000; v.health = 90 + rnd.nextInt(10); return "Maintenance completed for " + v.id + ". Health is now " + v.health + "%, next service in 5000 km.";
        }
    }

    static synchronized int fixAll() {
        List<String[]> l = alerts();
        for (String[] a : l) fix(find(a[0]), a[1]);
        return l.size();
    }

    static synchronized void optimize() { for (Vehicle v : fleet) v.pos = Math.min(99, v.pos + rnd.nextInt(21)); }

    // ---------- AI agent (rule-based reasoning over live fleet data) ----------
    static synchronized String agent(String raw) {
        String m = raw.toLowerCase();
        java.util.regex.Matcher mt = java.util.regex.Pattern.compile("(\\d{3})").matcher(m);
        Vehicle v = mt.find() ? find("FL-" + mt.group(1)) : null;
        if (has(m, "where", "track", "locat", "position") && v != null)
            return v.id + " (" + v.driver + ") is " + (int) v.pos + "% of the way from " + v.from + " to " + v.to + ".";
        if (has(m, "fix all", "resolve all", "handle all", "fix everything")) {
            List<String[]> l = alerts();
            if (l.isEmpty()) return "No active alerts. The fleet is healthy.";
            StringBuilder sb = new StringBuilder("Resolving " + l.size() + " alert(s):\n");
            for (String[] a : l) sb.append("- ").append(fix(find(a[0]), a[1])).append("\n");
            return sb.toString().trim();
        }
        if (has(m, "refuel", "fuel")) {
            Vehicle t = v != null ? v : worst(x -> x.fuel); int b = t.fuel;
            return "Checked " + t.id + ": fuel was " + b + "%.\n" + fix(t, "fuel");
        }
        if (has(m, "service", "maintenance", "repair", "inspect")) {
            Vehicle t = v != null ? v : worst(x -> x.kmToService); int b = t.kmToService;
            return "Checked " + t.id + ": " + b + " km to service.\n" + fix(t, "service");
        }
        if (has(m, "reassign", "driver", "behavio")) {
            Vehicle t = v != null ? v : worst(x -> x.behavior); int b = t.behavior;
            return "Checked " + t.id + ": behavior score was " + b + "%.\n" + fix(t, "behavior");
        }
        if (has(m, "optim", "route")) {
            optimize();
            return "Route optimization done for all " + fleet.size() + " vehicles. Faster paths found, trips are ahead of schedule.";
        }
        if (has(m, "alert", "problem", "issue", "critical", "attention", "urgent")) {
            List<String[]> l = alerts();
            if (l.isEmpty()) return "No active alerts. All vehicles look good.";
            StringBuilder sb = new StringBuilder(l.size() + " active alert(s):\n");
            for (String[] a : l) sb.append("- ").append(a[0]).append(" [").append(a[2]).append("]: ").append(a[3]).append(". ").append(a[4]).append("\n");
            return sb.append("Say \"fix all alerts\" and I will handle them.").toString();
        }
        if (has(m, "status", "summary", "overview", "fleet", "health")) {
            int h = 0, f = 0; for (Vehicle x : fleet) { h += x.health; f += x.fuel; }
            Vehicle lf = worst(x -> x.fuel), ls = worst(x -> x.kmToService);
            return "Fleet summary: " + fleet.size() + " vehicles, average health " + h / fleet.size() + "%, average fuel " + f / fleet.size()
                + "%, " + alerts().size() + " active alert(s).\nLowest fuel: " + lf.id + " (" + lf.fuel + "%). Next service: " + ls.id + " in " + ls.kmToService + " km.";
        }
        return "I can help with: fleet summary, show alerts, fix all alerts, refuel FL-102, service FL-106, reassign driver FL-105, where is FL-103, optimize routes.";
    }

    // ---------- HTTP server ----------
    public static void main(String[] args) throws Exception {
        connectDb(); loadFleet();
        Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(() -> { try { tick(); } catch (Exception ignored) { } }, 2, 2, TimeUnit.SECONDS);
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", FleetPilot::handle);
        server.start();
        System.out.println("=====================================================");
        System.out.println(" FleetPilot AI is running!  Open: http://localhost:8080");
        System.out.println(" Login -> username: admin   password: admin123");
        System.out.println(" (Press Ctrl+C to stop)");
        System.out.println("=====================================================");
    }

    static void handle(HttpExchange ex) throws IOException {
        try {
            String path = ex.getRequestURI().getPath();
            if (path.startsWith("/api/")) api(ex, path); else serveStatic(ex, path);
        } catch (Exception e) {
            send(ex, 500, "text/plain", "Server error");
        } finally {
            ex.close();
        }
    }

    static void api(HttpExchange ex, String path) throws IOException {
        boolean post = ex.getRequestMethod().equals("POST");
        Map<String, String> q = form(ex.getRequestURI().getRawQuery());
        String ok = "{\"ok\":true}";
        switch (path) {
            case "/api/login": {
                Map<String, String> f = form(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                boolean good = "admin".equals(f.get("user")) && "admin123".equals(f.get("pass"));
                send(ex, good ? 200 : 401, "application/json", good ? ok : "{\"ok\":false}");
                break;
            }
            case "/api/vehicles": send(ex, 200, "application/json", allJson()); break;
            case "/api/alerts": send(ex, 200, "application/json", alertsJson()); break;
            case "/api/agent": {
                Map<String, String> f = form(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                send(ex, 200, "application/json", "{\"reply\":\"" + esc(agent(f.getOrDefault("msg", ""))) + "\"}");
                break;
            }
            case "/api/fix": {
                Vehicle v = find(q.getOrDefault("id", ""));
                if (post && v != null) fix(v, q.getOrDefault("type", "service"));
                send(ex, 200, "application/json", ok);
                break;
            }
            case "/api/fixall": if (post) fixAll(); send(ex, 200, "application/json", ok); break;
            case "/api/reassign": {
                Vehicle v = find(q.getOrDefault("id", ""));
                if (post && v != null) fix(v, "behavior");
                send(ex, 200, "application/json", ok);
                break;
            }
            case "/api/optimize": if (post) optimize(); send(ex, 200, "application/json", ok); break;
            case "/api/status":
                send(ex, 200, "application/json", "{\"db\":" + (conn != null) + ",\"mode\":\"" + (conn != null ? "MySQL" : "In-memory") + "\",\"error\":\"" + esc(dbError) + "\"}");
                break;
            case "/api/cities": {
                StringBuilder sb = new StringBuilder("[");
                for (String c : CITIES.keySet()) { if (sb.length() > 1) sb.append(','); sb.append('"').append(c).append('"'); }
                send(ex, 200, "application/json", sb.append(']').toString());
                break;
            }
            case "/api/logs": send(ex, 200, "application/json", logsJson()); break;
            case "/api/addvehicle": {
                String r = post ? addVehicle(q.getOrDefault("driver", ""), q.getOrDefault("from", ""), q.getOrDefault("to", "")) : "Use POST";
                send(ex, 200, "application/json", "{\"msg\":\"" + esc(r) + "\"}");
                break;
            }
            case "/api/delvehicle": if (post) delVehicle(q.getOrDefault("id", "")); send(ex, 200, "application/json", ok); break;
            case "/api/reset": if (post) resetDemo(); send(ex, 200, "application/json", ok); break;
            default: send(ex, 404, "application/json", "{\"error\":\"not found\"}");
        }
    }

    static Map<String, String> form(String s) throws UnsupportedEncodingException {
        Map<String, String> m = new HashMap<>();
        if (s == null || s.isEmpty()) return m;
        for (String pair : s.split("&")) {
            String[] kv = pair.split("=", 2);
            m.put(URLDecoder.decode(kv[0], "UTF-8"), kv.length > 1 ? URLDecoder.decode(kv[1], "UTF-8") : "");
        }
        return m;
    }

    static void serveStatic(HttpExchange ex, String path) throws IOException {
        if (path.equals("/")) path = "/index.html";
        Path base = Paths.get("static").toAbsolutePath().normalize();
        Path file = base.resolve(path.substring(1)).normalize();
        if (!file.startsWith(base) || !Files.isRegularFile(file)) { send(ex, 404, "text/plain", "Not found"); return; }
        String n = file.toString();
        String type = n.endsWith(".html") ? "text/html" : n.endsWith(".css") ? "text/css" : n.endsWith(".js") ? "application/javascript" : "application/octet-stream";
        send(ex, 200, type, new String(Files.readAllBytes(file), StandardCharsets.UTF_8));
    }

    static void send(HttpExchange ex, int code, String type, String body) throws IOException {
        byte[] b = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", type + "; charset=utf-8");
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        ex.sendResponseHeaders(code, b.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(b); }
    }
}
