import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDb {
    public static void main(String[] args) throws Exception {
        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/athletehub?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true", "root", "connect");
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("ALTER TABLE athletes MODIFY user_id INT NULL");
            System.out.println("Table altered successfully");
        }
    }
}
