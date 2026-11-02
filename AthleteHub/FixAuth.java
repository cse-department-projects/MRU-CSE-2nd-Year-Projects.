import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class FixAuth {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/athletehub?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true", "root", "connect");
             Statement stmt = conn.createStatement()) {
            
            // Print user list
            try (ResultSet rs = stmt.executeQuery("SELECT user, host, plugin FROM mysql.user")) {
                System.out.println("MySQL Users:");
                while (rs.next()) {
                    System.out.println("User: " + rs.getString("user") + ", Host: " + rs.getString("host") + ", Plugin: " + rs.getString("plugin"));
                }
            }
            
            // Let's alter root at other potential hosts just in case
            try {
                stmt.executeUpdate("ALTER USER 'root'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'connect'");
                System.out.println("Altered root@127.0.0.1 successfully");
            } catch (Exception e) {
                System.out.println("Could not alter root@127.0.0.1: " + e.getMessage());
            }

            try {
                stmt.executeUpdate("ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'connect'");
                System.out.println("Altered root@% successfully");
            } catch (Exception e) {
                System.out.println("Could not alter root@%: " + e.getMessage());
            }

            stmt.executeUpdate("FLUSH PRIVILEGES");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
