import java.sql.*;

public class CheckDB {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/youthchallenge", "root", "");
        Statement stmt = conn.createStatement();
        
        System.out.println("--- MEMBERS ---");
        ResultSet rs2 = stmt.executeQuery("SELECT user_id, community_id, level, xp FROM community_members");
        while (rs2.next()) {
            System.out.println("U:" + rs2.getInt("user_id") + " C:" + rs2.getInt("community_id") + " L:" + rs2.getInt("level") + " XP:" + rs2.getInt("xp"));
        }
        
        System.out.println("--- BADGES ---");
        ResultSet rs = stmt.executeQuery("SELECT id, community_id, name, required_level FROM community_badges");
        while (rs.next()) {
            System.out.println("ID:" + rs.getInt("id") + " C:" + rs.getInt("community_id") + " N:" + rs.getString("name") + " L:" + rs.getInt("required_level"));
        }
        
        conn.close();
    }
}
