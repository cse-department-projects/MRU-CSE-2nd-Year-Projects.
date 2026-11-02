@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-25"
set "PATH=%JAVA_HOME%\bin;%PATH%"
..\maven\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests > package_output.txt 2>&1
echo Done.
