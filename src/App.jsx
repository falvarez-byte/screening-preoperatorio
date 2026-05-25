import React, { useState, useEffect } from 'react';

export default function AnesthesiologyRoomViz() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const petroleo = '#1A4A56';
  const teal = '#3E8A98';
  const blanco = '#F2F1ED';
  const madera = '#C9B393';
  const verde = '#6B8E6F';
  const grafito = '#2D2D2D';

  const generateWaveform = (phase, amplitude = 1, frequency = 1) => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 800;
      const y = 80 + Math.sin((i / 100 + phase) * Math.PI * 2 * frequency) * amplitude * 30;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: blanco }}>
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${petroleo} 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, ${teal} 0%, transparent 50%)`,
          }}
        />
        <div className="relative text-center z-10 px-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-4" style={{ color: petroleo }}>
            Vigilancia
          </h1>
          <p className="text-xl md:text-2xl mb-8" style={{ color: grafito }}>
            Ambientación temática de la estación de anestesiología
          </p>
          <div className="inline-block px-8 py-3 rounded-full text-white font-medium"
            style={{ backgroundColor: teal }}>
            Desplaza para explorar
          </div>
        </div>
      </div>

      {/* Room Visualization */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-5xl">
          <div className="relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden border-8"
            style={{ backgroundColor: blanco, borderColor: petroleo }}>

            {/* Grid Background */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={petroleo} strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Room Content */}
            <div className="absolute inset-0 flex flex-col p-12">
              {/* Waveforms */}
              <div className="flex-1 flex flex-col justify-start gap-8 mb-12">
                <div className="flex gap-3 items-center">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: petroleo }} />
                  <p className="text-sm font-semibold" style={{ color: petroleo }}>
                    Líneas de monitoreo anestésico
                  </p>
                </div>

                <svg className="w-full h-12" viewBox="0 0 800 160">
                  <polyline points={generateWaveform(scrollY * 0.01, 1, 2)}
                    fill="none" stroke={petroleo} strokeWidth="3" strokeLinecap="round" />
                </svg>

                <svg className="w-full h-12" viewBox="0 0 800 160">
                  <polyline points={generateWaveform(scrollY * 0.015, 0.8, 1.5)}
                    fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" />
                </svg>

                <svg className="w-full h-12" viewBox="0 0 800 160">
                  <polyline points={generateWaveform(scrollY * 0.012, 0.9, 1.8)}
                    fill="none" stroke={petroleo} strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Bottom Elements */}
              <div className="flex justify-between items-end">
                {/* Cabinets */}
                <div className="flex gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-16 h-32 rounded border-2"
                      style={{ backgroundColor: madera, borderColor: petroleo }} />
                  ))}
                </div>

                {/* Lighthouse - Vigilancia */}
                <div className="text-center">
                  <div className="w-20 h-24 rounded-full border-4 mx-auto mb-2 flex items-center justify-center relative"
                    style={{ borderColor: petroleo, background: `linear-gradient(135deg, ${petroleo}20, ${teal}20)` }}>
                    <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: teal }} />
                  </div>
                  <p className="text-xs font-bold tracking-widest" style={{ color: petroleo }}>
                    VIGILANCIA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Palette Section */}
      <div className="py-24 px-4" style={{ backgroundColor: `${petroleo}08` }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center" style={{ color: petroleo }}>
            Paleta Cromática
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: 'Petróleo Profundo', color: petroleo, hex: '#1A4A56' },
              { name: 'Teal Sereno', color: teal, hex: '#3E8A98' },
              { name: 'Blanco Clínico', color: blanco, hex: '#F2F1ED' },
              { name: 'Madera Natural', color: madera, hex: '#C9B393' },
              { name: 'Verde Salvia', color: verde, hex: '#6B8E6F' },
              { name: 'Grafito', color: grafito, hex: '#2D2D2D' },
            ].map((swatch) => (
              <div key={swatch.hex} className="text-center">
                <div className="w-full aspect-square rounded-lg shadow-md border-4 mb-3 hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: swatch.color, borderColor: `${swatch.color}40` }} />
                <p className="font-semibold" style={{ color: petroleo }}>{swatch.name}</p>
                <p className="text-xs text-gray-500">{swatch.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Design Elements */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: petroleo }}>
            Elementos de Diseño
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Línea de Monitoreo', desc: 'Curvas minimalistas de ECG, capnografía y pletismografía en el muro principal' },
              { title: 'Faro "Vigilancia"', desc: 'Símbolo de atención constante, pieza identitaria del concepto' },
              { title: 'Iluminación Cálida', desc: 'LED 3500K e iluminación indirecta que suaviza el ambiente' },
              { title: 'Banda Histórica', desc: 'Timeline de hitos de anestesiología desde 1846 a presente' },
            ].map((elem, i) => (
              <div key={i} className="p-6 rounded-lg border-2 hover:shadow-md transition-all"
                style={{ borderColor: teal, backgroundColor: blanco }}>
                <h3 className="font-bold mb-2" style={{ color: petroleo }}>{elem.title}</h3>
                <p className="text-sm" style={{ color: grafito }}>{elem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-16 text-center text-sm" style={{ backgroundColor: `${petroleo}10`, color: grafito }}>
        <p className="font-semibold">Propuesta de Ambientación Temática • Anestesiología</p>
        <p className="mt-1">Clínica Las Condes • Mayo 2026</p>
      </div>
    </div>
  );
}
