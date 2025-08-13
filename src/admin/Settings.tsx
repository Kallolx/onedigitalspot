import React, { useState, useEffect } from "react";

const Settings = () => {
  // State for different customization sections
  const [activeTab, setActiveTab] = useState('theme');
  
  // Theme colors state
  const [colors, setColors] = useState({
    background: { h: 220, s: 13, l: 8 },
    foreground: { h: 210, s: 20, l: 92 },
    primary: { h: 142, s: 45, l: 55 },
    secondary: { h: 220, s: 9, l: 46 },
    accent: { h: 142, s: 60, l: 70 },
    card: { h: 220, s: 13, l: 11 },
    border: { h: 220, s: 13, l: 20 },
  });

  // Branding state
  const [branding, setBranding] = useState({
    siteName: 'LootBox Retro Zone',
    logo: '/public/assets/logo.svg',
    favicon: '/public/favicon.ico',
    bannerImage: '/public/assets/1.png',
    heroTitle: 'Welcome to Retro Gaming Zone',
    heroSubtitle: 'Your ultimate destination for retro gaming content',
  });

  // Layout state
  const [layout, setLayout] = useState({
    borderRadius: 12,
    shadowIntensity: 8,
    cardSpacing: 24,
    fontSize: 16,
    fontFamily: 'DM Sans',
  });

  // Predefined color themes
  const colorThemes = {
    'Dark Green': {
      background: { h: 220, s: 13, l: 8 },
      primary: { h: 142, s: 45, l: 55 },
      secondary: { h: 220, s: 9, l: 46 },
      accent: { h: 142, s: 60, l: 70 },
    },
    'Blue Ocean': {
      background: { h: 220, s: 13, l: 8 },
      primary: { h: 210, s: 70, l: 50 },
      secondary: { h: 220, s: 9, l: 46 },
      accent: { h: 200, s: 60, l: 60 },
    },
    'Purple Night': {
      background: { h: 220, s: 13, l: 8 },
      primary: { h: 270, s: 50, l: 55 },
      secondary: { h: 220, s: 9, l: 46 },
      accent: { h: 290, s: 60, l: 70 },
    },
    'Orange Retro': {
      background: { h: 220, s: 13, l: 8 },
      primary: { h: 25, s: 85, l: 55 },
      secondary: { h: 220, s: 9, l: 46 },
      accent: { h: 40, s: 80, l: 65 },
    },
  };

  // Function to update CSS variables
  const updateCSSVariables = (newColors) => {
    const root = document.documentElement;
    
    Object.keys(newColors).forEach(colorName => {
      const { h, s, l } = newColors[colorName];
      root.style.setProperty(`--${colorName}`, `${h} ${s}% ${l}%`);
      
      if (colorName === 'primary') {
        root.style.setProperty(`--primary-foreground`, l > 50 ? '0 0% 0%' : '0 0% 100%');
      }
      if (colorName === 'secondary') {
        root.style.setProperty(`--secondary-foreground`, l > 50 ? '0 0% 0%' : '0 0% 100%');
      }
      if (colorName === 'card') {
        root.style.setProperty(`--card-foreground`, `${newColors.foreground?.h || 210} ${newColors.foreground?.s || 20}% ${newColors.foreground?.l || 92}%`);
      }
    });
  };

  // Update layout variables
  const updateLayoutVariables = () => {
    const root = document.documentElement;
    root.style.setProperty(`--radius`, `${layout.borderRadius}px`);
    root.style.setProperty(`--shadow-retro`, `${layout.shadowIntensity}px ${layout.shadowIntensity}px 0px hsl(142 45% 25%)`);
    root.style.setProperty(`--font-size-base`, `${layout.fontSize}px`);
  };

  useEffect(() => {
    updateCSSVariables(colors);
  }, [colors]);

  useEffect(() => {
    updateLayoutVariables();
  }, [layout]);

  const handleColorChange = (colorName, property, value) => {
    setColors(prev => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        [property]: parseInt(value)
      }
    }));
  };

  const applyColorTheme = (themeName) => {
    const theme = colorThemes[themeName];
    setColors(prev => ({
      ...prev,
      ...theme,
      foreground: prev.foreground,
      card: prev.card,
      border: prev.border,
    }));
  };

  const handleImageUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBranding(prev => ({
          ...prev,
          [field]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-button' 
          : 'bg-card text-card-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );

  const ColorSlider = ({ label, value, onChange, min = 0, max = 100 }) => (
    <div>
      <label className="text-sm text-muted-foreground">{label}: {value}{label.toLowerCase().includes('hue') ? '°' : '%'}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-pixel font-bold text-primary">Website Customization</h1>
        <button 
          onClick={() => {
            console.log('Saving all settings:', { colors, branding, layout });
            alert('Settings saved! (TODO: Implement Appwrite save)');
          }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-80 transition-opacity font-medium shadow-button"
        >
          💾 Save All Changes
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-card rounded-lg border border-border">
        <TabButton id="theme" label="🎨 Colors & Theme" isActive={activeTab === 'theme'} onClick={setActiveTab} />
        <TabButton id="branding" label="🖼️ Branding & Images" isActive={activeTab === 'branding'} onClick={setActiveTab} />
        <TabButton id="layout" label="📐 Layout & Typography" isActive={activeTab === 'layout'} onClick={setActiveTab} />
        <TabButton id="presets" label="✨ Quick Presets" isActive={activeTab === 'presets'} onClick={setActiveTab} />
      </div>

      {/* Theme Colors Tab */}
      {activeTab === 'theme' && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-retro">
          <h2 className="text-xl font-bold text-foreground mb-4">🎨 Color Customization</h2>
          <p className="text-muted-foreground mb-6">Adjust your website's color scheme with real-time preview.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Object.entries(colors).map(([colorName, { h, s, l }]) => (
              <div key={colorName} className="space-y-4 p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-border"
                    style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
                  ></div>
                  <h3 className="font-semibold capitalize text-foreground">{colorName}</h3>
                </div>
                
                <div className="space-y-3">
                  <ColorSlider 
                    label="Hue" 
                    value={h} 
                    min={0} 
                    max={360}
                    onChange={(e) => handleColorChange(colorName, 'h', e.target.value)} 
                  />
                  <ColorSlider 
                    label="Saturation" 
                    value={s} 
                    onChange={(e) => handleColorChange(colorName, 's', e.target.value)} 
                  />
                  <ColorSlider 
                    label="Lightness" 
                    value={l} 
                    onChange={(e) => handleColorChange(colorName, 'l', e.target.value)} 
                  />
                </div>
                
                <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                  hsl({h}, {s}%, {l}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-retro">
          <h2 className="text-xl font-bold text-foreground mb-4">🖼️ Branding & Images</h2>
          <p className="text-muted-foreground mb-6">Upload and manage your website's visual identity.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Site Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Site Information</h3>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Site Name</label>
                <input
                  type="text"
                  value={branding.siteName}
                  onChange={(e) => setBranding(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Hero Title</label>
                <input
                  type="text"
                  value={branding.heroTitle}
                  onChange={(e) => setBranding(prev => ({ ...prev, heroTitle: e.target.value }))}
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Hero Subtitle</label>
                <textarea
                  value={branding.heroSubtitle}
                  onChange={(e) => setBranding(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground h-24 resize-none"
                />
              </div>
            </div>

            {/* Image Uploads */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Images & Assets</h3>
              
              {[
                { field: 'logo', label: 'Logo', current: branding.logo },
                { field: 'favicon', label: 'Favicon', current: branding.favicon },
                { field: 'bannerImage', label: 'Hero Banner', current: branding.bannerImage },
              ].map(({ field, label, current }) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm text-muted-foreground">{label}</label>
                  <div className="flex items-center gap-4">
                    {current && (
                      <img 
                        src={current} 
                        alt={label}
                        className="w-12 h-12 object-cover rounded border border-border"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(field, e)}
                      className="flex-1 p-2 bg-background border border-border rounded text-foreground text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-retro">
          <h2 className="text-xl font-bold text-foreground mb-4">📐 Layout & Typography</h2>
          <p className="text-muted-foreground mb-6">Customize spacing, typography, and visual elements.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Border Radius: {layout.borderRadius}px</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={layout.borderRadius}
                  onChange={(e) => setLayout(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Shadow Intensity: {layout.shadowIntensity}px</label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={layout.shadowIntensity}
                  onChange={(e) => setLayout(prev => ({ ...prev, shadowIntensity: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Base Font Size: {layout.fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={layout.fontSize}
                  onChange={(e) => setLayout(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Primary Font</label>
                <select 
                  value={layout.fontFamily}
                  onChange={(e) => setLayout(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full p-3 bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="DM Sans">DM Sans (Default)</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-2">Preview</h4>
                <div 
                  className="p-4 bg-primary text-primary-foreground rounded shadow-retro"
                  style={{ 
                    borderRadius: `${layout.borderRadius}px`,
                    fontFamily: layout.fontFamily,
                    fontSize: `${layout.fontSize}px`
                  }}
                >
                  Sample button with current settings
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-retro">
          <h2 className="text-xl font-bold text-foreground mb-4">✨ Quick Theme Presets</h2>
          <p className="text-muted-foreground mb-6">Apply pre-designed color themes instantly.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(colorThemes).map(([themeName, theme]) => (
              <div 
                key={themeName}
                className="p-4 bg-background rounded-lg border border-border cursor-pointer hover:shadow-card transition-shadow"
                onClick={() => applyColorTheme(themeName)}
              >
                <h3 className="font-medium text-foreground mb-3">{themeName}</h3>
                <div className="flex gap-2 mb-3">
                  {Object.entries(theme).map(([colorName, { h, s, l }]) => (
                    <div 
                      key={colorName}
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
                      title={colorName}
                    ></div>
                  ))}
                </div>
                <button className="w-full bg-primary text-primary-foreground py-2 rounded text-sm hover:opacity-80 transition-opacity">
                  Apply Theme
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
