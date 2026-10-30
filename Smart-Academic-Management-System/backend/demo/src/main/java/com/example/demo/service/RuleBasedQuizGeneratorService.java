package com.example.demo.service;

import com.example.demo.dto.AiQuizRequest;
import com.example.demo.entity.EducationalMaterial;
import com.example.demo.repository.EducationalMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RuleBasedQuizGeneratorService {

    private final EducationalMaterialRepository materialRepository;

    private final Random random = new Random();

    public RuleBasedQuizGeneratorService(
            EducationalMaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    /*
     * ============================================================
     * MAIN METHOD
     * ============================================================
     */
    public List<Map<String, Object>> generateQuiz(
            AiQuizRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Quiz request is required."
            );
        }

        if (request.getMaterialId() == null) {
            throw new IllegalArgumentException(
                    "Educational material is required."
            );
        }

        EducationalMaterial material =
                materialRepository.findById(
                        request.getMaterialId()
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Educational material not found."
                        )
                );

        String content = material.getContent();

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException(
                    "The selected educational material has no readable content."
            );
        }

        String topic = request.getTopic();

        if (topic == null || topic.isBlank()) {
            throw new IllegalArgumentException(
                    "Topic is required."
            );
        }

        int numberOfQuestions = 5;

        if (request.getNumberOfQuestions() != null
                && request.getNumberOfQuestions() > 0) {

            numberOfQuestions =
                    Math.min(
                            request.getNumberOfQuestions(),
                            20
                    );
        }

        /*
         * --------------------------------------------------------
         * 1. Extract useful text from uploaded material
         * --------------------------------------------------------
         */
        List<String> lines =
                extractLines(content);

        /*
         * --------------------------------------------------------
         * 2. Remove headings, code and useless lines
         * --------------------------------------------------------
         */
        List<String> usefulLines =
                filterUsefulLines(lines);

        if (usefulLines.isEmpty()) {
            throw new IllegalArgumentException(
                    "No readable educational information was found in the uploaded material."
            );
        }

        /*
         * --------------------------------------------------------
         * 3. Find lines related to selected topic
         * --------------------------------------------------------
         */
        List<String> topicLines =
                findTopicLines(
                        usefulLines,
                        topic
                );

        /*
         * If the exact topic isn't found, use related
         * words from the topic.
         */
        if (topicLines.isEmpty()) {

            topicLines =
                    findRelatedTopicLines(
                            usefulLines,
                            topic
                    );
        }

        if (topicLines.isEmpty()) {
            throw new IllegalArgumentException(
                    "No information related to '" +
                            topic +
                            "' was found in the uploaded material."
            );
        }

        /*
         * --------------------------------------------------------
         * 4. Convert educational text into FACTS
         * --------------------------------------------------------
         */
        List<Fact> topicFacts =
                extractFacts(topicLines);

        /*
         * If the topic itself has few facts, extract all
         * facts from the uploaded material for distractors.
         */
        List<Fact> allFacts =
                extractFacts(usefulLines);

        if (allFacts.size() < 4) {
            throw new IllegalArgumentException(
                    "The uploaded material does not contain enough educational information to create proper MCQs."
            );
        }

        /*
         * --------------------------------------------------------
         * 5. Generate questions
         * --------------------------------------------------------
         */
        List<Map<String, Object>> questions =
                new ArrayList<>();

        Set<String> usedQuestions =
                new HashSet<>();

        /*
         * First use facts directly related to the topic.
         */
        for (Fact fact : topicFacts) {

            if (questions.size() >= numberOfQuestions) {
                break;
            }

            Map<String, Object> question =
                    createQuestion(
                            fact,
                            allFacts
                    );

            if (question == null) {
                continue;
            }

            String questionText =
                    String.valueOf(
                            question.get("questionText")
                    );

            if (usedQuestions.add(
                    questionText.toLowerCase()
            )) {
                questions.add(question);
            }
        }

        /*
         * If the selected topic doesn't contain enough
         * facts, use other valid facts from the same
         * uploaded educational material.
         */
        if (questions.size() < numberOfQuestions) {

            for (Fact fact : allFacts) {

                if (questions.size() >= numberOfQuestions) {
                    break;
                }

                Map<String, Object> question =
                        createQuestion(
                                fact,
                                allFacts
                        );

                if (question == null) {
                    continue;
                }

                String questionText =
                        String.valueOf(
                                question.get("questionText")
                        );

                if (usedQuestions.add(
                        questionText.toLowerCase()
                )) {
                    questions.add(question);
                }
            }
        }

        if (questions.isEmpty()) {
            throw new IllegalArgumentException(
                    "Unable to generate proper questions from the uploaded material."
            );
        }

        return questions;
    }

    /*
     * ============================================================
     * CREATE QUESTION
     * ============================================================
     */
    private Map<String, Object> createQuestion(
            Fact fact,
            List<Fact> allFacts) {

        if (fact == null) {
            return null;
        }

        if (fact.type == null
                || fact.term == null
                || fact.value == null) {
            return null;
        }

        String questionText =
                buildQuestion(fact);

        if (questionText == null
                || questionText.isBlank()) {
            return null;
        }

        /*
         * Build meaningful answer options.
         */
        List<String> options =
                buildOptions(
                        fact,
                        allFacts
                );

        if (options.size() < 4) {
            return null;
        }

        Collections.shuffle(
                options,
                random
        );

        int correctIndex = -1;

        for (int i = 0; i < options.size(); i++) {

            if (options.get(i)
                    .equalsIgnoreCase(
                            fact.value
                    )) {

                correctIndex = i;
                break;
            }
        }

        if (correctIndex == -1) {
            return null;
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "questionText",
                questionText
        );

        result.put(
                "optionA",
                options.get(0)
        );

        result.put(
                "optionB",
                options.get(1)
        );

        result.put(
                "optionC",
                options.get(2)
        );

        result.put(
                "optionD",
                options.get(3)
        );

        result.put(
                "correctAnswer",
                String.valueOf(
                        (char) ('A' + correctIndex)
                )
        );

        result.put(
                "marks",
                1
        );

        result.put(
                "questionType",
                "MCQ"
        );

        return result;
    }

    /*
     * ============================================================
     * QUESTION BUILDER
     * ============================================================
     */
    private String buildQuestion(
            Fact fact) {

        String term =
                cleanTerm(fact.term);

        if (term.isBlank()) {
            return null;
        }

        /*
         * PERSON
         *
         * Example:
         * Java was developed by Sun Microsystems.
         *
         * Question:
         * Who developed Java?
         */
        if ("PERSON".equals(fact.type)) {

            return "Who developed "
                    + term
                    + "?";
        }

        /*
         * DEFINITION
         *
         * Example:
         * Platform: Any hardware or software environment
         * in which a program runs.
         */
        if ("DEFINITION".equals(fact.type)) {

            return "What is "
                    + term
                    + "?";
        }

        /*
         * PURPOSE
         *
         * Example:
         * JRE is used to run Java programs.
         */
        if ("PURPOSE".equals(fact.type)) {

            return "What is the purpose of "
                    + term
                    + "?";
        }

        /*
         * FEATURE
         *
         * Example:
         * Java supports object-oriented programming.
         */
        if ("FEATURE".equals(fact.type)) {

            return "Which statement correctly describes "
                    + term
                    + "?";
        }

        /*
         * COMPONENT
         */
        if ("COMPONENT".equals(fact.type)) {

            return "Which statement about "
                    + term
                    + " is correct?";
        }

        /*
         * DEFAULT
         */
        return "Which statement correctly describes "
                + term
                + "?";
    }

    /*
     * ============================================================
     * OPTIONS
     * ============================================================
     */
    private List<String> buildOptions(
            Fact correctFact,
            List<Fact> allFacts) {

        List<String> options =
                new ArrayList<>();

        String correctValue =
                cleanAnswer(correctFact.value);

        if (correctValue.isBlank()) {
            return options;
        }

        options.add(correctValue);

        List<String> wrongAnswers =
                new ArrayList<>();

        for (Fact fact : allFacts) {

            if (fact == null) {
                continue;
            }

            String value =
                    cleanAnswer(fact.value);

            if (value.isBlank()) {
                continue;
            }

            /*
             * Don't use the same answer.
             */
            if (value.equalsIgnoreCase(
                    correctValue)) {
                continue;
            }

            /*
             * Don't use meaningless words.
             */
            if (isBadAnswer(value)) {
                continue;
            }

            boolean duplicate = false;

            for (String existing : wrongAnswers) {

                if (existing.equalsIgnoreCase(value)) {
                    duplicate = true;
                    break;
                }
            }

            if (!duplicate) {
                wrongAnswers.add(value);
            }
        }

        Collections.shuffle(
                wrongAnswers,
                random
        );

        for (String answer : wrongAnswers) {

            if (options.size() >= 4) {
                break;
            }

            options.add(answer);
        }

        return options;
    }

    /*
     * ============================================================
     * FACT EXTRACTION
     * ============================================================
     */
    private List<Fact> extractFacts(
            List<String> lines) {

        List<Fact> facts =
                new ArrayList<>();

        for (String line : lines) {

            Fact fact =
                    extractFact(line);

            if (fact == null) {
                continue;
            }

            boolean duplicate = false;

            for (Fact existing : facts) {

                if (existing.term.equalsIgnoreCase(
                        fact.term)
                        && existing.value.equalsIgnoreCase(
                        fact.value)) {

                    duplicate = true;
                    break;
                }
            }

            if (!duplicate) {
                facts.add(fact);
            }
        }

        return facts;
    }

    /*
     * ============================================================
     * EXTRACT ONE FACT
     * ============================================================
     */
    private Fact extractFact(
            String original) {

        if (original == null
                || original.isBlank()) {

            return null;
        }

        String text =
                cleanLine(original);

        if (text.length() < 15
                || text.length() > 500) {

            return null;
        }

        if (looksLikeCode(text)) {
            return null;
        }

        /*
         * --------------------------------------------------------
         * 1. COLON DEFINITION
         *
         * Platform: Any hardware or software environment...
         * --------------------------------------------------------
         */
        Matcher colon =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,70})\\s*:\\s*(.+)$"
                ).matcher(text);

        if (colon.matches()) {

            String term =
                    cleanTerm(
                            colon.group(1)
                    );

            String value =
                    cleanAnswer(
                            colon.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "DEFINITION"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 2. "X was developed by Y"
         *
         * Java was developed by Sun Microsystems.
         * --------------------------------------------------------
         */
        Matcher developedBy =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 .()+\\-/]{1,60})\\s+was\\s+developed\\s+by\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (developedBy.matches()) {

            String term =
                    cleanTerm(
                            developedBy.group(1)
                    );

            String person =
                    cleanAnswer(
                            developedBy.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(person)) {

                return new Fact(
                        term,
                        person,
                        "PERSON"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 3. "X was created by Y"
         * --------------------------------------------------------
         */
        Matcher createdBy =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 .()+\\-/]{1,60})\\s+was\\s+created\\s+by\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (createdBy.matches()) {

            String term =
                    cleanTerm(
                            createdBy.group(1)
                    );

            String person =
                    cleanAnswer(
                            createdBy.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(person)) {

                return new Fact(
                        term,
                        person,
                        "PERSON"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 4. "X was designed by Y"
         * --------------------------------------------------------
         */
        Matcher designedBy =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 .()+\\-/]{1,60})\\s+was\\s+designed\\s+by\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (designedBy.matches()) {

            String term =
                    cleanTerm(
                            designedBy.group(1)
                    );

            String person =
                    cleanAnswer(
                            designedBy.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(person)) {

                return new Fact(
                        term,
                        person,
                        "PERSON"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 5. "X is used for..."
         * --------------------------------------------------------
         */
        Matcher usedFor =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,70})\\s+is\\s+used\\s+for\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (usedFor.matches()) {

            String term =
                    cleanTerm(
                            usedFor.group(1)
                    );

            String value =
                    "Used for "
                            + cleanAnswer(
                            usedFor.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "PURPOSE"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 6. "X is used to..."
         * --------------------------------------------------------
         */
        Matcher usedTo =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,70})\\s+is\\s+used\\s+to\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (usedTo.matches()) {

            String term =
                    cleanTerm(
                            usedTo.group(1)
                    );

            String value =
                    "Used to "
                            + cleanAnswer(
                            usedTo.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "PURPOSE"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 7. "X provides..."
         * --------------------------------------------------------
         */
        Matcher provides =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,70})\\s+provides\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (provides.matches()) {

            String term =
                    cleanTerm(
                            provides.group(1)
                    );

            String value =
                    cleanAnswer(
                            provides.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "FEATURE"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 8. "X supports..."
         * --------------------------------------------------------
         */
        Matcher supports =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,70})\\s+supports\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (supports.matches()) {

            String term =
                    cleanTerm(
                            supports.group(1)
                    );

            String value =
                    cleanAnswer(
                            supports.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "FEATURE"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 9. "X allows..."
         * --------------------------------------------------------
         */
        Matcher allows =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,70})\\s+allows\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (allows.matches()) {

            String term =
                    cleanTerm(
                            allows.group(1)
                    );

            String value =
                    cleanAnswer(
                            allows.group(2)
                    );

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "FEATURE"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 10. "X is..."
         *
         * Only allow a SHORT and meaningful term.
         * --------------------------------------------------------
         */
        Matcher is =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,50})\\s+is\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (is.matches()) {

            String term =
                    cleanTerm(
                            is.group(1)
                    );

            String value =
                    cleanAnswer(
                            is.group(2)
                    );

            if (containsBadHeadingWords(term)) {
                return null;
            }

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "DEFINITION"
                );
            }
        }

        /*
         * --------------------------------------------------------
         * 11. "X are..."
         * --------------------------------------------------------
         */
        Matcher are =
                Pattern.compile(
                        "^([A-Za-z][A-Za-z0-9 ()/+\\-]{1,50})\\s+are\\s+(.+)$",
                        Pattern.CASE_INSENSITIVE
                ).matcher(text);

        if (are.matches()) {

            String term =
                    cleanTerm(
                            are.group(1)
                    );

            String value =
                    cleanAnswer(
                            are.group(2)
                    );

            if (containsBadHeadingWords(term)) {
                return null;
            }

            if (isValidTerm(term)
                    && isValidAnswer(value)) {

                return new Fact(
                        term,
                        value,
                        "DEFINITION"
                );
            }
        }

        return null;
    }

    /*
     * ============================================================
     * TEXT EXTRACTION
     * ============================================================
     */
    private List<String> extractLines(
            String content) {

        List<String> result =
                new ArrayList<>();

        String normalized =
                content
                        .replace("\r\n", "\n")
                        .replace("\r", "\n");

        String[] lines =
                normalized.split("\\n+");

        for (String line : lines) {

            String cleaned =
                    cleanLine(line);

            if (cleaned.length() < 10) {
                continue;
            }

            /*
             * If a line contains multiple sentences,
             * split them.
             */
            String[] parts =
                    cleaned.split(
                            "(?<=[.!?])\\s+"
                    );

            for (String part : parts) {

                String value =
                        cleanLine(part);

                if (value.length() >= 10
                        && value.length() <= 500) {

                    result.add(value);
                }
            }
        }

        return removeDuplicates(result);
    }

    /*
     * ============================================================
     * FILTER USEFUL LINES
     * ============================================================
     */
    private List<String> filterUsefulLines(
            List<String> lines) {

        List<String> result =
                new ArrayList<>();

        for (String line : lines) {

            if (line == null
                    || line.isBlank()) {
                continue;
            }

            String lower =
                    line.toLowerCase();

            /*
             * Ignore obvious headings.
             */
            if (isHeading(lower)) {
                continue;
            }

            /*
             * Ignore code.
             */
            if (looksLikeCode(line)) {
                continue;
            }

            /*
             * Ignore navigation/instruction text.
             */
            if (lower.equals("contents")
                    || lower.equals("introduction")
                    || lower.equals("summary")
                    || lower.equals("conclusion")
                    || lower.equals("thank you")) {

                continue;
            }

            result.add(line);
        }

        return removeDuplicates(result);
    }

    /*
     * ============================================================
     * TOPIC FILTER
     * ============================================================
     */
    private List<String> findTopicLines(
            List<String> lines,
            String topic) {

        List<String> result =
                new ArrayList<>();

        String search =
                topic.trim()
                        .toLowerCase();

        for (String line : lines) {

            if (line.toLowerCase()
                    .contains(search)) {

                result.add(line);
            }
        }

        return removeDuplicates(result);
    }

    private List<String> findRelatedTopicLines(
            List<String> lines,
            String topic) {

        List<String> result =
                new ArrayList<>();

        String[] words =
                topic.toLowerCase()
                        .split("\\s+");

        for (String line : lines) {

            String lower =
                    line.toLowerCase();

            for (String word : words) {

                String clean =
                        word.replaceAll(
                                "[^a-zA-Z0-9]",
                                ""
                        );

                if (clean.length() >= 3
                        && lower.contains(clean)) {

                    result.add(line);
                    break;
                }
            }
        }

        return removeDuplicates(result);
    }

    /*
     * ============================================================
     * VALIDATION
     * ============================================================
     */
    private boolean isValidTerm(
            String term) {

        if (term == null
                || term.isBlank()) {
            return false;
        }

        String value =
                term.trim();

        if (value.length() < 2
                || value.length() > 70) {
            return false;
        }

        String lower =
                value.toLowerCase();

        String[] invalid = {
                "there",
                "these",
                "those",
                "this",
                "that",
                "what",
                "which",
                "example",
                "examples",
                "introduction",
                "overview",
                "summary",
                "conclusion",
                "following",
                "above",
                "below"
        };

        for (String word : invalid) {

            if (lower.equals(word)) {
                return false;
            }
        }

        /*
         * Never accept a complete sentence as a term.
         */
        if (value.contains("?")
                || value.contains("!")) {
            return false;
        }

        /*
         * Don't allow very long phrases.
         */
        if (value.split("\\s+").length > 7) {
            return false;
        }

        return true;
    }

    private boolean isValidAnswer(
            String answer) {

        if (answer == null
                || answer.isBlank()) {
            return false;
        }

        String value =
                answer.trim();

        if (value.length() < 5
                || value.length() > 500) {
            return false;
        }

        if (isBadAnswer(value)) {
            return false;
        }

        return true;
    }

    private boolean isBadAnswer(
            String answer) {

        String lower =
                answer.trim()
                        .toLowerCase();

        return lower.equals("there")
                || lower.equals("these")
                || lower.equals("those")
                || lower.equals("this")
                || lower.equals("that")
                || lower.equals("example")
                || lower.equals("examples");
    }

    private boolean containsBadHeadingWords(
            String term) {

        String lower =
                term.toLowerCase();

        return lower.contains(
                        "introduction to"
                )
                || lower.contains(
                        "what is"
                )
                || lower.contains(
                        "what are"
                )
                || lower.contains(
                        "example:"
                );
    }

    private boolean isHeading(
            String text) {

        String lower =
                text.trim()
                        .toLowerCase();

        return lower.equals("introduction")
                || lower.equals("introduction to java")
                || lower.equals("overview")
                || lower.equals("summary")
                || lower.equals("conclusion")
                || lower.equals("contents")
                || lower.equals("agenda")
                || lower.equals("objectives")
                || lower.equals("references")
                || lower.startsWith("chapter ")
                || lower.startsWith("unit ");
    }

    private boolean looksLikeCode(
            String text) {

        String lower =
                text.toLowerCase();

        String[] patterns = {
                "public class",
                "public static",
                "private ",
                "protected ",
                "system.out",
                "println(",
                "import ",
                "package ",
                "new ",
                "if(",
                "if (",
                "else",
                "for(",
                "for (",
                "while(",
                "while (",
                "switch(",
                "switch (",
                "return ",
                "int ",
                "float ",
                "double ",
                "short ",
                "long ",
                "byte ",
                "char ",
                "boolean ",
                "string ",
                "{",
                "}"
        };

        for (String pattern : patterns) {

            if (lower.contains(pattern)) {
                return true;
            }
        }

        /*
         * Assignment syntax.
         */
        if (text.matches(
                ".*\\b[a-zA-Z_][a-zA-Z0-9_]*\\s*=\\s*.*"
        )) {
            return true;
        }

        return false;
    }

    /*
     * ============================================================
     * CLEANING
     * ============================================================
     */
    private String cleanLine(
            String text) {

        if (text == null) {
            return "";
        }

        return text
                .replace("\u0000", " ")
                .replace("\u00A0", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String cleanTerm(
            String term) {

        if (term == null) {
            return "";
        }

        return term
                .replaceAll(
                        "^[\\s:;,\\-]+",
                        ""
                )
                .replaceAll(
                        "[\\s:;,\\-]+$",
                        ""
                )
                .replaceAll(
                        "\\s+",
                        " "
                )
                .trim();
    }

    private String cleanAnswer(
            String answer) {

        if (answer == null) {
            return "";
        }

        return answer
                .replaceAll(
                        "\\s+",
                        " "
                )
                .replaceAll(
                        "^[\\s:;,\\-]+",
                        ""
                )
                .replaceAll(
                        "[.!?]+$",
                        ""
                )
                .trim();
    }

    private List<String> removeDuplicates(
            List<String> values) {

        LinkedHashMap<String, String> map =
                new LinkedHashMap<>();

        for (String value : values) {

            if (value == null
                    || value.isBlank()) {
                continue;
            }

            map.putIfAbsent(
                    value.toLowerCase(),
                    value
            );
        }

        return new ArrayList<>(
                map.values()
        );
    }

    /*
     * ============================================================
     * FACT CLASS
     * ============================================================
     */
    private static class Fact {

        private final String term;
        private final String value;
        private final String type;

        private Fact(
                String term,
                String value,
                String type) {

            this.term = term;
            this.value = value;
            this.type = type;
        }
    }
}

