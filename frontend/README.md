# Frontend - Text Sharing

A simple and modern frontend for sharing text quickly and efficiently.

## 🚀 Features

- **Submission form**: Intuitive interface for creating and sharing text content
- **Text visualization**: Dedicated page for viewing shared content (no titles)
- **Responsive design**: Works perfectly on mobile and desktop
- **Modern experience**: UI/UX with gradients, animations and visual effects
- **Advanced features**:
  - Real-time character counter
  - Automatic draft saving
  - Copy to clipboard
  - Native sharing (Web Share API)
  - Keyboard shortcuts
  - Content type detection

## 📁 File Structure

```
frontend/
├── index.html          # Main page with form
├── view.html           # Page for viewing text
├── styles.css          # Modern CSS styles
├── script.js           # JavaScript for form
├── view-script.js      # JavaScript for visualization
└── README.md           # This file
```

## 🛠️ Setup

### 1. API Endpoints

The frontend expects the following API endpoints:

**POST** `http://localhost:8009/text`
```json
{
  "content": "Your text content here",
  "ttl": 60
}
```

**GET** `http://localhost:8009/text/{id}`
```json
{
  "id": "mw3cJ1ge6",
  "content": "Your text content here",
  "ttl": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 2. Configure the API

Edit the `API_BASE_URL` variable in both JavaScript files:

```javascript
// In script.js and view-script.js
const API_BASE_URL = 'http://localhost:8009'; // Change according to your backend
```

### 2. Serve the files

You can use any static web server:

```bash
# With Python 3
python -m http.server 8000

# With Node.js (npx)
npx serve .

# With PHP
php -S localhost:8000

# With Live Server (VS Code extension)
# Right click on index.html -> "Open with Live Server"
```

### 3. Access the application

Open your browser and go to:
- `http://localhost:8000` - Main page
- `http://localhost:8000/view.html?id=TEXT_ID` - View specific text

## 🎨 Design Features

### Colors and Gradients
- **Main background**: Purple-blue gradient
- **Primary buttons**: Purple-blue gradient
- **Secondary buttons**: Light gray
- **Text**: Soft black (#333)

### Typography
- **Main font**: OS font system
- **Monospace**: For code content
- **Responsive sizes**: Adapt to different screens

### Visual Effects
- **Soft shadows**: For depth
- **Animations**: Smooth transitions
- **Backdrop blur**: Blur effects
- **Hover effects**: Visual interactions

## 📱 Responsive Design

The frontend is optimized for:

- **Mobile** (< 480px): Vertical layout, full-width buttons
- **Tablets** (480px - 768px): Adaptive layout
- **Desktop** (> 768px): Two-column layout

## 🔧 JavaScript Features

### Form (script.js)
- ✅ Real-time validation
- ✅ Character counter
- ✅ Textarea auto-resize
- ✅ Automatic draft saving
- ✅ Character limit (50,000)
- ✅ Success modal with link
- ✅ Copy to clipboard
- ✅ TTL options: 1 min, 15 min, 1 hour, 24 hours

### Visualization (view-script.js)
- ✅ Asynchronous content loading
- ✅ Loading and error states
- ✅ Real-time countdown timer (based on creation timestamp)
- ✅ Auto-reload when text expires
- ✅ Content type detection
- ✅ Dynamic meta tags
- ✅ Keyboard shortcuts
- ✅ Web Share API

## ⌨️ Keyboard Shortcuts

### Main Page
- `Tab` - Navigate between fields
- `Ctrl/Cmd + Enter` - Submit form

### View Page
- `Ctrl/Cmd + C` - Copy text
- `Ctrl/Cmd + S` - Share
- `Escape` - Go to home

## 🌐 Compatibility

### Supported Browsers
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### APIs Used
- ✅ Fetch API
- ✅ Clipboard API (with fallback)
- ✅ Web Share API (with fallback)
- ✅ LocalStorage
- ✅ Service Workers (optional)

## 🔒 Security

- Frontend input validation
- Content sanitization
- Recommended security headers
- No sensitive data storage

## 📊 Performance

- Optimized and minified CSS
- Modular JavaScript
- Lazy loading of resources
- Local draft caching

## 🚀 Deployment

### Hosting Options
- **Netlify**: Drag & drop files
- **Vercel**: Git integration
- **GitHub Pages**: Free hosting
- **Firebase Hosting**: Google hosting

### Production Configuration
1. Change `API_BASE_URL` to your production domain
2. Configure CORS in backend
3. Enable HTTPS
4. Configure Service Worker (optional)

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch at 'http://localhost:8009' from origin 'http://localhost:8000' has been blocked by CORS policy
```
**Solution**: Configure CORS in your backend to allow your frontend domain.

### Clipboard API Error
```
The Clipboard API has been blocked because of a permissions policy
```
**Solution**: The code includes automatic fallback for browsers that don't support Clipboard API.

### Web Share API Error
```
navigator.share is not a function
```
**Solution**: The code includes automatic fallback to copy URL to clipboard.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 📞 Support

If you have problems or questions:
1. Check the troubleshooting section
2. Open an issue on GitHub
3. Contact the development team

---

Enjoy sharing text quickly and easily! 🚀 