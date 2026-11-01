package com.educonnect.backend.controller;

import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private static final String GROQ_API_KEY = System.getenv("GROQ_API_KEY") != null ? System.getenv("GROQ_API_KEY") : "";
    private static final String GROQ_MODEL = "openai/gpt-oss-120b";
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @PostMapping("/chat")
    public Map<String, Object> chatWithCoach(@RequestBody Map<String, Object> request) {
        String prompt = (String) request.getOrDefault("prompt", "Hello");
        String cleanPrompt = prompt.replace("\"", "\\\"").replace("\n", " ");

        String systemPrompt = "You are the EduConnect AI Study Coach, an expert, encouraging academic mentor for university engineering students. " +
                "Student Context: Name: Keshvi, Roll: MRU001, Dept: CSE Year 2, Overall Attendance: 85.8%, Weaker Area: Operating Systems (77%), Strongest: DBMS (88%). " +
                "Provide clear, actionable, and encouraging study guidance with bullet points or code snippets when helpful.";
        String cleanSystem = systemPrompt.replace("\"", "\\\"");

        String requestBody = "{" +
                "\"model\":\"" + GROQ_MODEL + "\"," +
                "\"messages\":[" +
                "{\"role\":\"system\",\"content\":\"" + cleanSystem + "\"}," +
                "{\"role\":\"user\",\"content\":\"" + cleanPrompt + "\"}" +
                "]," +
                "\"temperature\":0.7," +
                "\"max_tokens\":800" +
                "}";

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .header("Authorization", "Bearer " + GROQ_API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String body = response.body();
                // Simple JSON extraction for response message content
                int contentIdx = body.indexOf("\"content\":");
                if (contentIdx != -1) {
                    int start = body.indexOf("\"", contentIdx + 10) + 1;
                    int end = body.indexOf("\"", start);
                    // Search for next unescaped quote or parse substring
                    String rawContent = extractContent(body);
                    return Map.of("response", rawContent, "model", GROQ_MODEL);
                }
            }
            return Map.of("response", "Keep focused on your Operating Systems revision and complete your DBMS normalization assignment on time!", "model", GROQ_MODEL);
        } catch (Exception e) {
            return Map.of("response", "AI Study Coach recommendation: Review Operating Systems process scheduling and submit your pending DBMS normalization assignment.", "error", e.getMessage());
        }
    }

    private String extractContent(String json) {
        try {
            int marker = json.indexOf("\"content\":");
            if (marker == -1) return "Consistent study and active class participation will keep your grades strong.";
            int startQuote = json.indexOf("\"", marker + 10);
            int cur = startQuote + 1;
            StringBuilder sb = new StringBuilder();
            while (cur < json.length()) {
                char c = json.charAt(cur);
                if (c == '\\') {
                    if (cur + 1 < json.length()) {
                        char next = json.charAt(cur + 1);
                        if (next == 'n') sb.append("\n");
                        else if (next == 't') sb.append("\t");
                        else if (next == '"') sb.append("\"");
                        else sb.append(next);
                        cur += 2;
                        continue;
                    }
                } else if (c == '"') {
                    break;
                } else {
                    sb.append(c);
                }
                cur++;
            }
            return sb.toString();
        } catch (Exception e) {
            return "Focus on your weaker subject (Operating Systems) this week.";
        }
    }
}
