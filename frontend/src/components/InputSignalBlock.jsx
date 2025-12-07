import { useRef, useState, useEffect } from 'react';
import { useParametersStore, useAnalysisStore, useModalStore } from '@src/store';
import { uploadAudio, analyzeAudio } from '@src/api';
import Graph from './Graph';

function InputSignalBlock() {
    const { 
        data: analysisData, 
        setAnalysisData, 
        clearAnalysisData 
    } = useAnalysisStore();
    
    const waveform = analysisData?.waveform;
    const graphData = waveform ? { x: waveform.time, y: waveform.amplitude } : null;

    const { fftWindow, stftWindow, signalNormalization } = useParametersStore();

    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

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

        clearAnalysisData();  
    };

    const handleAnalyze = async () => {
        if (!file) return;
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setState('analyzing');

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

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
                result = await analyzeAudio(uploadResult.fileName, analysisOptions);
            } else {
                result = await analyzeAudio(uploadedFileName, analysisOptions);
            }

            if (signal.aborted) return;

            if (result && result.data) {
                const fileNameToSave = file ? file.name : 'audio_file';

                setAnalysisData(result.data, fileNameToSave);
                setState('file_ready');
            } else {
                throw new Error("Сервер не повернув даних");
            }

        } catch (err) {
            if (err.message !== 'Аналіз скасовано') {
                if (signal.aborted || err.name === 'AbortError') return;
                showModal('Audio analysis error', { text: err.message || 'Unknown error' });
            }
            setState('file_ready');
        } finally {
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