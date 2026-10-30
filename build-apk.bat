@echo off
echo ========================================================
echo    Microplastics Monitor - Android APK Builder
echo ========================================================
echo.

echo [1/3] Building Web Application with Vite...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Web build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Syncing assets to native Android project...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed!
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compiling Android APK with Gradle...
cd android
if not defined JAVA_HOME (
    echo [WARNING] JAVA_HOME is not set. Gradle will attempt to use default Java.
)
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTE] Local Gradle build requires Java 17+ and Android SDK.
    echo If you do not have Java 17 or Android Studio installed locally:
    echo  - Push your code to GitHub: "git push origin main"
    echo  - GitHub Actions will automatically compile your APK and provide
    echo    a direct download link in the Actions tab!
    echo  - Or open with Android Studio: "npm run mobile:open"
    cd ..
    exit /b %ERRORLEVEL%
)

cd ..
echo.
echo ========================================================
echo [SUCCESS] APK Built Successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================================
pause

