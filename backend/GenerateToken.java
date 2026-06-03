import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import java.nio.charset.StandardCharsets;
import java.security.Key;

public class GenerateToken {
    public static void main(String[] args) {
        String secret = "YouthChallenge2026SuperSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm";
        Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .setSubject("admin") // Assuming username is admin
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
        System.out.println(token);
    }
}
