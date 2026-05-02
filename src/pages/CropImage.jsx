import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion } from 'framer-motion';
import Dropzone from '../components/Dropzone';
import { Scissors, Download, RefreshCcw, Maximize, Crop } from 'lucide-react';

const CropImage = () => {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(16 / 9);
  const imgRef = useRef(null);

  const onSelectFile = (files) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(files[0]);
    }
  };

  const onImageLoad = (e) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          { unit: '%', width: 90 },
          aspect,
          width,
          height
        ),
        width,
        height
      ));
    }
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'cropped-image.png';
    link.href = base64Image;
    link.click();
  };

  const aspectRatios = [
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 },
    { label: 'Free', value: undefined },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Crop <span className="gradient-text">Image</span>
        </h1>
        <p className="text-white/50 text-lg">
          Perfectly frame your images with precise aspect ratio controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-morphism p-8 rounded-3xl border border-white/5 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Crop className="text-primary" size={20} />
              Controls
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {aspectRatios.map(ar => (
                    <button
                      key={ar.label}
                      onClick={() => setAspect(ar.value)}
                      className={`py-2 rounded-xl border text-sm font-bold transition-all ${
                        aspect === ar.value 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={getCroppedImg}
                disabled={!completedCrop}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download Crop
              </button>

              {imgSrc && (
                <button 
                  onClick={() => setImgSrc('')}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {!imgSrc ? (
            <Dropzone onFilesDropped={onSelectFile} multiple={false} />
          ) : (
            <div className="glass-morphism p-4 rounded-[2rem] border border-white/5 flex justify-center overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[70vh] rounded-xl"
                />
              </ReactCrop>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropImage;

