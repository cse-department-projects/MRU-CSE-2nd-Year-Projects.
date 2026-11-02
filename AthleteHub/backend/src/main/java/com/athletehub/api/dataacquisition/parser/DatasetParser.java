package com.athletehub.api.dataacquisition.parser;

import com.athletehub.api.dataacquisition.dto.RawRecord;
import java.io.InputStream;
import java.util.Iterator;

public interface DatasetParser extends AutoCloseable {
    void initialize(InputStream inputStream) throws Exception;
    Iterator<RawRecord> iterator();
    int getTotalRows();
}
