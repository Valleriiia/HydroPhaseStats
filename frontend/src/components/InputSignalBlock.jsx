import { useRef, useState, useEffect } from 'react';
import { useResultPresenceStore, useModalStore, useAnalysisStore, useParametersStore } from '@src/store';
import { uploadAudio, analyzeAudio } from '@src/api';
import Graph from './Graph';

function InputSignalBlock() {
    // 1. Отримуємо дані для графіка
    const { data: analysisData, setAnalysisData } = useAnalysisStore();
    const waveform = analysisData?.waveform;
    const graphData = waveform ? { x: waveform.time, y: waveform.amplitude } : null;

    // 2. Отримуємо параметри аналізу зі стору
    const { fftWindow, stftWindow, signalNormalization } = useParametersStore();

    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const { setResultPresence } = useResultPresenceStore();
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
        
        // Скасовуємо попередній запит, якщо він ще триває
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setState('analyzing');

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Формуємо об'єкт опцій для передачі на бекенд
        const analysisOptions = {
            fftWindow,
            stftWindow,
            signalNormalization
        };

        try {
            let result;

            if (!uploadedFileName) {
                const uploadResult = await uploadAudio(file);
                if (signal.aborted) return;

                setUploadedFileName(uploadResult.fileName);
                // Передаємо опції
                result = await analyzeAudio(uploadResult.fileName, analysisOptions);
            } else {
                // Передаємо опції
                result = await analyzeAudio(uploadedFileName, analysisOptions);
            }

            if (signal.aborted) return;

            if (result && result.data) {
                setAnalysisData(result.data);
                setResultPresence();
                setState('file_ready');
            } else {
                throw new Error("Сервер не повернув даних");
            }

        } catch (err) {
            if (err.message !== 'Аналіз скасовано') {
                // Ігноруємо помилки скасування (AbortError)
                if (signal.aborted || err.name === 'AbortError') return;
                showModal('Audio analysis error', { text: err.message || 'Unknown error' });
            }
            setState('file_ready');
        } finally {
            // Очищаємо контролер тільки якщо це був саме наш запит
            if (abortControllerRef.current?.signal === signal) {
                abortControllerRef.current = null;
            }
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setState('file_ready');
    };

    // --- АВТОМАТИЧНЕ ОНОВЛЕННЯ ---
    // Цей ефект спрацьовує при зміні будь-якого параметра.
    // Якщо файл вже завантажено на сервер (uploadedFileName існує), ми перезапускаємо аналіз.
    useEffect(() => {
        if (uploadedFileName) {
            handleAnalyze();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fftWindow, stftWindow, signalNormalization]); 

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

            {graphData && (
                <div style={{ marginTop: '15px' }}>
                    <Graph data={graphData} type="line" color="#57E0E9" height={60} />
                </div>
            )}
        </section>
    );
}

export default InputSignalBlock;