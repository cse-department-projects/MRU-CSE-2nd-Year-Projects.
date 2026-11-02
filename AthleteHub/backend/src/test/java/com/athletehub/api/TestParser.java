package com.athletehub.api;

import com.athletehub.api.dataacquisition.parser.CsvDatasetParser;
import java.io.FileInputStream;

public class TestParser {
    public static void main(String[] args) {
        try {
            CsvDatasetParser parser = new CsvDatasetParser();
            parser.initialize(new FileInputStream("C:\\Users\\Sai Ram\\OneDrive\\Documents\\Athlete-hub\\data\\athletes.csv"));
            System.out.println("Headers initialized successfully. Total rows: " + parser.getTotalRows());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
