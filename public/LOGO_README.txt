ResQ Meal – App logo (frontend and backend)

Add your app logo here so it appears in the header, login page, browser tab, and as the default profile picture.

1. Save your image as:  logo.png
   (You can also use logo.jpg; then rename the reference in the app to /logo.jpg if you prefer.)

2. Place the file in this folder:  public/
   So the file path is:  public/logo.png

3. Recommended: square image, 256×256 or 512×512 pixels, PNG or JPG with transparent background.
   The same image is used in:
   - Top bar (header logo)
   - Login screen
   - Browser tab (favicon)
   - Default profile picture/avatar (when user has no custom profile photo)

4. Frontend: the app loads the logo from /logo.png (built from public/logo.png).
   Backend: if your backend serves static files or the built frontend, use the same path /logo.png so links and emails stay consistent.

Until you add public/logo.png, the app will show an “Add logo” placeholder where the logo would appear.
