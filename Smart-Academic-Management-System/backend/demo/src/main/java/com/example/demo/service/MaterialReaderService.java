package com.example.demo.service;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class MaterialReaderService {

    public String extractText(MultipartFile file) throws IOException {

        String fileName = file.getOriginalFilename();

        if (fileName == null) {
            throw new IllegalArgumentException("File name is missing");
        }

        String lowerName = fileName.toLowerCase();

        if (lowerName.endsWith(".pptx")) {
            return readPptx(file);
        }

        if (lowerName.endsWith(".pdf")) {
            return readPdf(file);
        }

        if (lowerName.endsWith(".docx")) {
            return readDocx(file);
        }

        throw new IllegalArgumentException(
                "Unsupported file type. Please upload PPTX, PDF, or DOCX."
        );
    }

    // =========================
    // READ POWERPOINT
    // =========================
    private String readPptx(MultipartFile file) throws IOException {

        StringBuilder text = new StringBuilder();

        try (InputStream inputStream = file.getInputStream();
             XMLSlideShow presentation = new XMLSlideShow(inputStream)) {

            presentation.getSlides().forEach(slide -> {

                for (XSLFShape shape : slide.getShapes()) {

                    if (shape instanceof XSLFTextShape textShape) {

                        String slideText = textShape.getText();

                        if (slideText != null && !slideText.isBlank()) {
                            text.append(slideText)
                                .append("\n");
                        }
                    }
                }

                text.append("\n");
            });
        }

        return text.toString().trim();
    }

    // =========================
    // READ PDF
    // =========================
    private String readPdf(MultipartFile file) throws IOException {

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document).trim();
        }
    }

    // =========================
    // READ DOCX
    // =========================
    private String readDocx(MultipartFile file) throws IOException {

        StringBuilder text = new StringBuilder();

        try (InputStream inputStream = file.getInputStream();
             XWPFDocument document = new XWPFDocument(inputStream)) {

            document.getParagraphs().forEach(paragraph -> {

                String paragraphText = paragraph.getText();

                if (paragraphText != null && !paragraphText.isBlank()) {
                    text.append(paragraphText)
                        .append("\n");
                }
            });
        }

        return text.toString().trim();
    }
}