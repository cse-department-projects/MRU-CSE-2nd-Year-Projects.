@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-25"
..\maven\apache-maven-3.9.6\bin\mvn.cmd test-compile exec:java -Dexec.mainClass="com.athletehub.api.TestParser" -Dexec.classpathScope=test
