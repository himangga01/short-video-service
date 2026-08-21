import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Mic2, Trash2, Wand2 } from 'lucide-react';
import { mediaUrl } from '../api/media';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  deletePanelImage,
  generatePanelTTS,
  updatePanel,
  uploadPanelImage,
} from '../store/slices/panelsSlice';
import type { Panel, UpdatePanelDTO } from '../types';

const voiceOptions: Array<{ value: Panel['voice_id']; label: string }> = [
  { value: 'Zephyr', label: 'Zephyr · Bright' },
  { value: 'Puck', label: 'Puck · Upbeat' },
  { value: 'Charon', label: 'Charon · Informative' },
  { value: 'Kore', label: 'Kore · Firm' },
  { value: 'Fenrir', label: 'Fenrir · Excitable' },
  { value: 'Leda', label: 'Leda · Youthful' },
  { value: 'Orus', label: 'Orus · Firm' },
  { value: 'Aoede', label: 'Aoede · Breezy' },
  { value: 'Callirrhoe', label: 'Callirrhoe · Easy-going' },
  { value: 'Autonoe', label: 'Autonoe · Bright' },
  { value: 'Enceladus', label: 'Enceladus · Breathy' },
  { value: 'Iapetus', label: 'Iapetus · Clear' },
  { value: 'Umbriel', label: 'Umbriel · Easy-going' },
  { value: 'Algieba', label: 'Algieba · Smooth' },
  { value: 'Despina', label: 'Despina · Smooth' },
  { value: 'Erinome', label: 'Erinome · Clear' },
  { value: 'Algenib', label: 'Algenib · Gravelly' },
  { value: 'Rasalgethi', label: 'Rasalgethi · Informative' },
  { value: 'Laomedeia', label: 'Laomedeia · Upbeat' },
  { value: 'Achernar', label: 'Achernar · Soft' },
  { value: 'Alnilam', label: 'Alnilam · Firm' },
  { value: 'Schedar', label: 'Schedar · Even' },
  { value: 'Gacrux', label: 'Gacrux · Mature' },
  { value: 'Pulcherrima', label: 'Pulcherrima · Forward' },
  { value: 'Achird', label: 'Achird · Friendly' },
  { value: 'Zubenelgenubi', label: 'Zubenelgenubi · Casual' },
  { value: 'Vindemiatrix', label: 'Vindemiatrix · Gentle' },
  { value: 'Sadachbia', label: 'Sadachbia · Lively' },
  { value: 'Sadaltager', label: 'Sadaltager · Knowledgeable' },
  { value: 'Sulafat', label: 'Sulafat · Warm' },
];

function normalizeVoiceId(voiceId?: string | null): Panel['voice_id'] {
  return voiceOptions.some((voice) => voice.value === voiceId)
    ? (voiceId as Panel['voice_id'])
    : 'Kore';
}

function formatMs(ms?: number | null) {
  if (!ms) return '길이 미확인';
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function PanelSettings() {
  const dispatch = useAppDispatch();
  const { panels, selectedPanelId } = useAppSelector((state) => state.panels);

  const selectedPanel = panels.find((panel) => panel.id === selectedPanelId);

  const [script, setScript] = useState(selectedPanel?.script || '');
  const [voiceId, setVoiceId] = useState<Panel['voice_id']>(
    normalizeVoiceId(selectedPanel?.voice_id)
  );
  const [voiceSpeed, setVoiceSpeed] = useState(selectedPanel?.voice_speed || 1.0);
  const [textSize, setTextSize] = useState(selectedPanel?.text_size || 22);
  const [textColor, setTextColor] = useState(selectedPanel?.text_color || '#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState(
    selectedPanel?.background_color || '#000000'
  );
  const [subtitlePosition, setSubtitlePosition] = useState<Panel['subtitle_position']>(
    selectedPanel?.subtitle_position || 'bottom'
  );
  const [ttsInstructions, setTtsInstructions] = useState(selectedPanel?.tts_instructions || '');

  useEffect(() => {
    if (selectedPanel) {
      setScript(selectedPanel.script);
      setVoiceId(normalizeVoiceId(selectedPanel.voice_id));
      setVoiceSpeed(selectedPanel.voice_speed);
      setTextSize(selectedPanel.text_size);
      setTextColor(selectedPanel.text_color);
      setBackgroundColor(selectedPanel.background_color);
      setSubtitlePosition(selectedPanel.subtitle_position);
      setTtsInstructions(selectedPanel.tts_instructions || '');
    }
  }, [selectedPanel]);

  const handleUpdate = <K extends keyof UpdatePanelDTO>(field: K, value: UpdatePanelDTO[K]) => {
    if (!selectedPanelId) return;

    dispatch(
      updatePanel({
        id: selectedPanelId,
        data: { [field]: value } as UpdatePanelDTO,
      })
    );
  };

  const handleImageChange = (file?: File) => {
    if (!selectedPanelId || !file) return;
    dispatch(uploadPanelImage({ id: selectedPanelId, file }));
  };

  const handleScriptSave = () => {
    const normalizedScript = script.trim();

    if (!normalizedScript) {
      setScript(selectedPanel?.script || '');
      return;
    }

    if (selectedPanel && normalizedScript !== selectedPanel.script) {
      handleUpdate('script', normalizedScript);
    }
  };

  const handleGenerateTTS = () => {
    if (!selectedPanelId) return;
    dispatch(generatePanelTTS({ id: selectedPanelId, instructions: ttsInstructions }));
  };

  if (!selectedPanel) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center px-4">
          <p className="text-lg">씬을 선택해주세요</p>
          <p className="text-sm mt-2">가운데 목록에서 씬을 클릭하면 설정을 바꿀 수 있습니다</p>
        </div>
      </div>
    );
  }

  const isTtsProcessing =
    selectedPanel.tts_status === 'processing' || selectedPanel.tts_status === 'queued';

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">씬 설정</h2>
          <p className="text-sm text-gray-500">선택된 씬: #{selectedPanel.order_index + 1}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">대본</h3>
          <textarea
            value={script}
            onChange={(event) => setScript(event.target.value)}
            onBlur={handleScriptSave}
            rows={6}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이 씬에서 읽을 대본을 입력하세요."
          />
          <p className="text-xs text-gray-500">
            {script.trim().length}자 · 입력 후 포커스를 벗어나면 저장됩니다.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">음성 설정</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">음성 선택</label>
            <select
              value={voiceId}
              onChange={(event) => {
                const value = event.target.value as Panel['voice_id'];
                setVoiceId(value);
                handleUpdate('voice_id', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {voiceOptions.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              재생 속도: {voiceSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceSpeed}
              onChange={(event) => {
                const value = parseFloat(event.target.value);
                setVoiceSpeed(value);
                handleUpdate('voice_speed', value);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>2.0x</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TTS 연출 지시</label>
            <textarea
              value={ttsInstructions}
              onChange={(event) => setTtsInstructions(event.target.value)}
              onBlur={() => handleUpdate('tts_instructions', ttsInstructions.trim() || null)}
              rows={3}
              placeholder="예: 긴장감 있게, 썰을 들려주는 듯 자연스럽게 읽어주세요."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Gemini TTS로 생성되는 AI 음성이므로 최종 영상/서비스에서 AI 음성 고지가 필요합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateTTS}
            disabled={isTtsProcessing}
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTtsProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isTtsProcessing ? 'TTS 생성 중...' : '이 씬 TTS 생성'}
          </button>

          {selectedPanel.audio_url && selectedPanel.tts_status === 'completed' && (
            <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                <Mic2 className="h-4 w-4" />
                TTS 완료 · {formatMs(selectedPanel.audio_duration_ms)}
              </div>
              <audio controls src={mediaUrl(selectedPanel.audio_url)} className="w-full" />
            </div>
          )}

          {selectedPanel.tts_error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {selectedPanel.tts_error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">텍스트 설정</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              글자 크기: {textSize}px
            </label>
            <input
              type="range"
              min="12"
              max="48"
              step="2"
              value={textSize}
              onChange={(event) => {
                const value = parseInt(event.target.value);
                setTextSize(value);
                handleUpdate('text_size', value);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>12px</span>
              <span>48px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">글자 색상</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(event) => {
                  const value = event.target.value;
                  setTextColor(value);
                  handleUpdate('text_color', value);
                }}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(event) => {
                  const value = event.target.value;
                  setTextColor(value);
                  if (value.match(/^#[0-9A-F]{6}$/i)) {
                    handleUpdate('text_color', value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">배경 색상</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(event) => {
                  const value = event.target.value;
                  setBackgroundColor(value);
                  handleUpdate('background_color', value);
                }}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(event) => {
                  const value = event.target.value;
                  setBackgroundColor(value);
                  if (value.match(/^#[0-9A-F]{6}$/i)) {
                    handleUpdate('background_color', value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">자막 위치</label>
            <select
              value={subtitlePosition}
              onChange={(event) => {
                const value = event.target.value as Panel['subtitle_position'];
                setSubtitlePosition(value);
                handleUpdate('subtitle_position', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">상단</option>
              <option value="middle">중앙</option>
              <option value="bottom">하단</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">이미지 설정</h3>

          {selectedPanel.image_url ? (
            <div className="space-y-3">
              <img
                src={mediaUrl(selectedPanel.image_url)}
                alt="선택된 씬 이미지"
                className="w-full rounded border border-gray-200 object-cover"
              />
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer rounded bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
                  이미지 교체
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageChange(event.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => dispatch(deletePanelImage(selectedPanel.id))}
                  className="inline-flex items-center justify-center rounded border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                  aria-label="이미지 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 hover:border-blue-300 hover:bg-blue-50">
              <ImagePlus className="mb-2 h-8 w-8 text-gray-400" />
              {selectedPanel.image_status === 'uploading'
                ? '이미지 업로드 중...'
                : '이미지를 업로드하세요'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImageChange(event.target.files?.[0])}
              />
            </label>
          )}

          {selectedPanel.image_error && (
            <p className="text-sm text-red-600">{selectedPanel.image_error}</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">미리보기</h3>
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor,
              color: textColor,
              fontSize: `${textSize}px`,
            }}
          >
            {selectedPanel.script || '텍스트 미리보기'}
          </div>
        </div>
      </div>
    </div>
  );
}
