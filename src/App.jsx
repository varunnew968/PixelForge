import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import CompressImage from './pages/CompressImage';
import ResizeImage from './pages/ResizeImage';
import ConvertImage from './pages/ConvertImage';
import CropImage from './pages/CropImage';
import RotateImage from './pages/RotateImage';
import WatermarkImage from './pages/WatermarkImage';
import EnhanceImage from './pages/EnhanceImage';
import RemoveBackground from './pages/RemoveBackground';
import FilterStudio from './pages/FilterStudio';
import MemeGenerator from './pages/MemeGenerator';
import ColorPalette from './pages/ColorPalette';
import ImageToPDF from './pages/ImageToPDF';
import ImageToBase64 from './pages/ImageToBase64';
import EXIFViewer from './pages/EXIFViewer';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { ToastProvider } from './components/Toast';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                {/* Core Tools */}
                <Route path="compress-image-online" element={<CompressImage />} />
                <Route path="resize-image-online" element={<ResizeImage />} />
                <Route path="convert-image-online" element={<ConvertImage />} />
                <Route path="crop-image-online" element={<CropImage />} />
                <Route path="rotate-image-online" element={<RotateImage />} />
                <Route path="watermark-image-online" element={<WatermarkImage />} />
                <Route path="enhance-image-online" element={<EnhanceImage />} />
                {/* New Tools */}
                <Route path="remove-background-online" element={<RemoveBackground />} />
                <Route path="filter-studio-online" element={<FilterStudio />} />
                <Route path="meme-generator-online" element={<MemeGenerator />} />
                <Route path="color-palette-online" element={<ColorPalette />} />
                <Route path="image-to-pdf-online" element={<ImageToPDF />} />
                <Route path="image-to-base64-online" element={<ImageToBase64 />} />
                <Route path="exif-viewer-online" element={<EXIFViewer />} />
                <Route path="about" element={<About />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
  );
}

export default App;
