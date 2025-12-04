import { useRef, useState } from 'react';
import { useResultPresenceStore, useModalStore, useAnalysisStore } from '@src/store'; // Додано useAnalysisStore
import { uploadAudio, analyzeAudio } from '@src/api';

function InputSignalBlock() {
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const { setResultPresence } = useResultPresenceStore();
    const { setAnalysisData } = useAnalysisStore(); // Отримуємо функцію запису
    const { open: showModal } = useModalStore();

    const [file, setFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [state, setState] = useState('idle');

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadedFileName(null);
            setState('file_ready');
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setUploadedFileName(null);
        setState('idle');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setState('analyzing');

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            let result; 

            // Логіка: завантажуємо, якщо ще не завантажили, потім аналізуємо
            if (!uploadedFileName) {
                const uploadResult = await uploadAudio(file);
                if (signal.aborted) return;

                setUploadedFileName(uploadResult.fileName);
                // Зберігаємо результат виклику analyzeAudio
                result = await analyzeAudio(uploadResult.fileName); 
            } else {
                result = await analyzeAudio(uploadedFileName);
            }

            if (signal.aborted) return;

            // ЗБЕРІГАЄМО ДАНІ У СТОР
            if (result && result.data) {
                setAnalysisData(result.data);
                setResultPresence(); // Активуємо UI
                setState('file_ready');
            } else {
                throw new Error("Сервер не повернув даних");
            }

        } catch (err) {
            if (err.message !== 'Аналіз скасовано') { // Припускаємо, що API кидає таку помилку при abort
                 if (signal.aborted) return; // Ігноруємо помилки, якщо це був ручний cancel
                 showModal('Audio analysis error', { text: err.message || 'Unknown error' });
            }
            setState('file_ready');
        } finally {
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setState('file_ready');
    };

    return (
        <section className="inputSignal">
            <div className="inputSignal__title">Input Signal</div>

            {state === 'idle' && (
                <>
                    <div className="inputSignal__center">
                        <div className="no_file">No file to analyze</div>
                        <button id="upload" onClick={handleChooseFile}>
                            Choose file
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="fileInput"
                        accept="audio/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </>
            )}

            {state === 'file_ready' && file && (
                <>
                    <div className="inputSignal__top">
                        <div className="audio_text">{file.name}</div>
                        <button id="remove" onClick={handleRemoveFile}>
                            Remove file
                        </button>
                        <button id="analyze" onClick={handleAnalyze}>
                            Analyze audio
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="fileInput"
                        accept="audio/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </>
            )}

            {state === 'analyzing' && (
                <div className="inputSignal__analyzing">
                    <div className="analyzing_text">Analyzing...</div>
                    <button id="cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            )}
        </section>
    );
}

export default InputSignalBlock;