// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState } from 'react';
import { t } from 'i18next';

interface ToneAudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedTones: string[], selectedAudiences: string[]) => void;
}

const ToneAudienceModal: React.FC<ToneAudienceModalProps> = ({ isOpen, onClose, onSave }) => {
  const tones = ['Formal', 'Informal', 'Optimistic', 'Serious', 'Friendly'];
  const audiences = ['General Public', 'Professionals', 'Students', 'Parents', 'Teachers'];

  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [customTone, setCustomTone] = useState<string>('');
  const [customAudience, setCustomAudience] = useState<string>('');

  const handleToneChange = (tone: string) => {
    setSelectedTones(prev =>
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  const handleAudienceChange = (audience: string) => {
    setSelectedAudiences(prev =>
      prev.includes(audience) ? prev.filter(a => a !== audience) : [...prev, audience]
    );
  };

  const handleSave = () => {
    const finalTones = [...selectedTones];
    const finalAudiences = [...selectedAudiences];

    if (customTone.trim()) {
      finalTones.push(customTone);
    }
    if (customAudience.trim()) {
      finalAudiences.push(customAudience);
    }
    onSave(finalTones, finalAudiences);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="bg-white rounded-lg shadow-lg p-6 z-10">
          <h2 className="text-lg font-semibold mb-4">{t('tone_audience_modal.select_tone_and_audience')}</h2>
          <div className="mb-4">
            <h3 className="font-medium mb-2">{t('tone_audience_modal.tones')}:</h3>
            <div className="grid grid-cols-3 gap-4">
              {tones.map(tone => (
                <div
                  key={tone}
                  onClick={() => handleToneChange(tone)}
                  className={`border rounded-lg p-2 px-4 text-center cursor-pointer transition-colors duration-200 ${
                    selectedTones.includes(tone)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tone}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={customTone}
                onChange={e => setCustomTone(e.target.value)}
                placeholder={t('tone_audience_modal.add_custom_tone')}
                className="border rounded-lg p-2 w-full"
              />
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-medium mb-2">{t('tone_audience_modal.audiences')}:</h3>
            <div className="grid grid-cols-3 gap-4">
              {audiences.map(audience => (
                <div
                  key={audience}
                  onClick={() => handleAudienceChange(audience)}
                  className={`border rounded-lg p-2 px-4 text-center cursor-pointer transition-colors duration-200 ${
                    selectedAudiences.includes(audience)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {audience}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={customAudience}
                onChange={e => setCustomAudience(e.target.value)}
                placeholder={t('tone_audience_modal.add_custom_audience')}
                className="border rounded-lg p-2 w-full"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
              {t('tone_audience_modal.save')}
            </button>
            <button onClick={onClose} className="ml-2 bg-gray-300 px-4 py-2 rounded">
              {t('tone_audience_modal.cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ToneAudienceModal;
