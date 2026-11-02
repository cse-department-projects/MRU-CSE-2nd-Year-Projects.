package com.athletehub.api.util;

import java.time.LocalDate;
import java.time.Period;

public class EligibilityValidator {

    public static boolean isMale(String gender) {
        if (gender == null) return false;
        String g = gender.trim().toUpperCase();
        return g.equals("MALE") || g.equals("MEN") || g.equals("MAN") || g.equals("BOYS") || g.equals("BOY") || g.equals("M");
    }

    public static boolean isFemale(String gender) {
        if (gender == null) return false;
        String g = gender.trim().toUpperCase();
        return g.equals("FEMALE") || g.equals("WOMEN") || g.equals("WOMAN") || g.equals("GIRLS") || g.equals("GIRL") || g.equals("F");
    }

    public static boolean isNeutralOrCoed(String category) {
        if (category == null || category.trim().isEmpty()) return true;
        String c = category.trim().toUpperCase();
        return c.equals("COED") || c.equals("MIXED") || c.equals("ANY") || c.equals("OPEN") || c.equals("ALL") || c.equals("ALL AGES");
    }

    /**
     * Checks if athlete gender is eligible for the target category (team gender or tournament gender category).
     */
    public static boolean isGenderEligible(String categoryGender, String athleteGender) {
        if (isNeutralOrCoed(categoryGender)) {
            return true;
        }
        if (isMale(categoryGender)) {
            return isMale(athleteGender);
        }
        if (isFemale(categoryGender)) {
            return isFemale(athleteGender);
        }
        return true;
    }

    /**
     * Validates gender and throws IllegalArgumentException on mismatch.
     */
    public static void validateGender(String categoryGender, String athleteGender, String athleteName, String contextType) {
        if (isNeutralOrCoed(categoryGender)) {
            return;
        }

        if (isMale(categoryGender) && isFemale(athleteGender)) {
            throw new IllegalArgumentException(String.format(
                "Gender mismatch: Female athlete '%s' cannot join a Male/Boys %s (%s).",
                athleteName, contextType, categoryGender
            ));
        }

        if (isFemale(categoryGender) && isMale(athleteGender)) {
            throw new IllegalArgumentException(String.format(
                "Gender mismatch: Male athlete '%s' cannot join a Female/Girls %s (%s).",
                athleteName, contextType, categoryGender
            ));
        }
    }

    /**
     * Extracts the maximum age limit from an age group string (e.g. "Under-14", "U16", "UNDER_19", "Junior Varsity").
     */
    public static Integer getMaxAgeLimit(String ageGroup) {
        if (ageGroup == null || ageGroup.trim().isEmpty()) return null;
        String norm = ageGroup.trim().toUpperCase();

        if (norm.contains("ALL AGES") || norm.equals("OPEN") || norm.contains("SENIOR")) {
            return null;
        }
        if (norm.contains("U14") || norm.contains("UNDER-14") || norm.contains("UNDER 14") || norm.contains("UNDER_14")) {
            return 14;
        }
        if (norm.contains("U16") || norm.contains("UNDER-16") || norm.contains("UNDER 16") || norm.contains("UNDER_16")) {
            return 16;
        }
        if (norm.contains("U18") || norm.contains("UNDER-18") || norm.contains("UNDER 18") || norm.contains("UNDER_18") || norm.contains("JUNIOR VARSITY")) {
            return 18;
        }
        if (norm.contains("U19") || norm.contains("UNDER-19") || norm.contains("UNDER 19") || norm.contains("UNDER_19")) {
            return 19;
        }
        if (norm.contains("U21") || norm.contains("UNDER-21") || norm.contains("UNDER 21") || norm.contains("UNDER_21") || norm.contains("SENIOR VARSITY")) {
            return 21;
        }
        if (norm.contains("U23") || norm.contains("UNDER-23") || norm.contains("UNDER 23") || norm.contains("UNDER_23")) {
            return 23;
        }
        if (norm.contains("COLLEGIATE")) {
            return 25;
        }

        // Generic regex match for U(\d+) or Under-(\d+)
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(?:U|UNDER[-_ ]?)(\\d+)").matcher(norm);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (NumberFormatException ignored) {}
        }

        return null;
    }

    /**
     * Extracts minimum age requirement if any (e.g. "Senior" typically implies >= 18).
     */
    public static Integer getMinAgeLimit(String ageGroup) {
        if (ageGroup == null || ageGroup.trim().isEmpty()) return null;
        String norm = ageGroup.trim().toUpperCase();
        if (norm.equals("SENIOR") || norm.contains("SENIOR / PROFESSIONAL")) {
            return 18;
        }
        return null;
    }

    /**
     * Checks if athlete age is eligible for the target category.
     */
    public static boolean isAgeEligible(String ageGroup, LocalDate dateOfBirth) {
        if (dateOfBirth == null || ageGroup == null) return true;
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();

        Integer maxAge = getMaxAgeLimit(ageGroup);
        if (maxAge != null && age > maxAge) {
            return false;
        }

        Integer minAge = getMinAgeLimit(ageGroup);
        if (minAge != null && age < minAge) {
            return false;
        }

        return true;
    }

    /**
     * Validates age and throws IllegalArgumentException on violation.
     */
    public static void validateAge(String ageGroup, LocalDate dateOfBirth, String athleteName, String contextType) {
        if (dateOfBirth == null || ageGroup == null || ageGroup.trim().isEmpty()) {
            return;
        }

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();

        Integer maxAge = getMaxAgeLimit(ageGroup);
        if (maxAge != null && age > maxAge) {
            throw new IllegalArgumentException(String.format(
                "Age limit exceeded: Athlete '%s' is %d years old (DOB: %s), which exceeds the maximum allowed age of %d for %s (%s).",
                athleteName, age, dateOfBirth, maxAge, contextType, ageGroup
            ));
        }

        Integer minAge = getMinAgeLimit(ageGroup);
        if (minAge != null && age < minAge) {
            throw new IllegalArgumentException(String.format(
                "Minimum age requirement not met: Athlete '%s' is %d years old (DOB: %s), which does not meet the minimum age of %d for %s (%s).",
                athleteName, age, dateOfBirth, minAge, contextType, ageGroup
            ));
        }
    }
}
