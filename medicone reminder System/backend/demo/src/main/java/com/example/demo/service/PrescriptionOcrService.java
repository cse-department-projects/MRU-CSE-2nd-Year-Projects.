package com.example.demo.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;

import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;

@Service
public class PrescriptionOcrService {

    public List<String> extractMedicineNames(
            MultipartFile file) throws Exception {

        List<String> medicines = new ArrayList<>();

        // Read uploaded image
        BufferedImage image =
                ImageIO.read(file.getInputStream());

        if (image == null) {
            throw new Exception("Invalid image file.");
        }

        // Create OCR engine
        Tesseract tesseract = new Tesseract();

        /*
         * IMPORTANT:
         * Change this path if Tesseract is installed
         * somewhere else.
         */
        tesseract.setDatapath(
                "C:\\Program Files\\Tesseract-OCR\\tessdata"
        );

        tesseract.setLanguage("eng");

        String text;

        try {

            text = tesseract.doOCR(image);

        } catch (TesseractException e) {

            throw new Exception(
                    "Tesseract OCR failed: "
                            + e.getMessage()
            );
        }

        System.out.println();
        System.out.println("========== OCR TEXT ==========");
        System.out.println(text);
        System.out.println("==============================");
        System.out.println();

        // Process OCR text
        String[] lines = text.split("\\r?\\n");

        for (String line : lines) {

            line = line.trim();

            if (line.length() < 3) {
                continue;
            }

            // Remove numbering
            line = line.replaceAll(
                    "^[0-9.\\-*)]+\\s*",
                    ""
            );

            // Remove extra spaces
            line = line.replaceAll(
                    "\\s+",
                    " "
            );

            String lower = line.toLowerCase();

            // Ignore common prescription information
            if (lower.contains("patient")
                    || lower.contains("doctor")
                    || lower.contains("hospital")
                    || lower.contains("clinic")
                    || lower.contains("address")
                    || lower.contains("phone")
                    || lower.contains("date")
                    || lower.contains("diagnosis")
                    || lower.contains("prescription")
                    || lower.contains("signature")) {

                continue;
            }

            // Ignore extremely long OCR sentences
            if (line.length() > 60) {
                continue;
            }

            /*
             * Check whether the OCR line looks like
             * a medicine name.
             *
             * (?i) = case-insensitive matching.
             */
            boolean medicineLike =
                    line.matches(".*[A-Za-z].*")
                    &&
                    (
                        line.matches(
                            "(?i).*\\d+\\s*(mg|ml|mcg|g|iu).*"
                        )
                        ||
                        line.matches(
                            "(?i).*\\b(tab|tablet|cap|capsule|syrup|drops|cream|ointment)\\b.*"
                        )
                        ||
                        (
                            line.split(" ").length <= 5
                            &&
                            Character.isUpperCase(
                                line.charAt(0)
                            )
                        )
                    );

            // Add detected medicine
            if (medicineLike
                    && !containsMedicine(
                            medicines,
                            line)) {

                medicines.add(line);
            }
        }

        return medicines;
    }


    /*
     * Check duplicate medicine names
     */
    private boolean containsMedicine(
            List<String> medicines,
            String medicine) {

        for (String existing : medicines) {

            if (existing.equalsIgnoreCase(medicine)) {
                return true;
            }
        }

        return false;
    }
}
