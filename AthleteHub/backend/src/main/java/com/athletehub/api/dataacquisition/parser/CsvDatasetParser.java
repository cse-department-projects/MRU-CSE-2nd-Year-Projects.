package com.athletehub.api.dataacquisition.parser;

import com.athletehub.api.dataacquisition.dto.RawRecord;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;

public class CsvDatasetParser implements DatasetParser {

    private CSVReader csvReader;
    private String[] headers;
    private int totalRows = -1; // -1 indicates streaming, total rows unknown unless pre-counted

    @Override
    public void initialize(InputStream inputStream) throws Exception {
        InputStreamReader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
        this.csvReader = new CSVReaderBuilder(reader).build();
        this.headers = csvReader.readNext();
        if (this.headers != null) {
            for (int i = 0; i < headers.length; i++) {
                headers[i] = headers[i].trim();
            }
        }
    }

    @Override
    public Iterator<RawRecord> iterator() {
        return new Iterator<>() {
            private String[] nextRow;

            private void fetchNext() {
                if (nextRow == null && csvReader != null) {
                    try {
                        nextRow = csvReader.readNext();
                    } catch (Exception e) {
                        nextRow = null;
                    }
                }
            }

            @Override
            public boolean hasNext() {
                fetchNext();
                return nextRow != null;
            }

            @Override
            public RawRecord next() {
                fetchNext();
                if (nextRow == null) {
                    throw new NoSuchElementException();
                }
                
                Map<String, String> data = new HashMap<>();
                StringBuilder rawLineBuilder = new StringBuilder();
                for (int i = 0; i < headers.length && i < nextRow.length; i++) {
                    data.put(headers[i], nextRow[i].trim());
                    rawLineBuilder.append(nextRow[i]);
                    if (i < nextRow.length - 1) {
                        rawLineBuilder.append(",");
                    }
                }
                
                RawRecord record = new RawRecord(data, rawLineBuilder.toString());
                nextRow = null;
                return record;
            }
        };
    }

    @Override
    public int getTotalRows() {
        return totalRows;
    }

    @Override
    public void close() throws Exception {
        if (csvReader != null) {
            csvReader.close();
        }
    }
}
