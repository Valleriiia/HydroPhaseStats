import { useRef, useState } from 'react';
import { useResultPresenceStore, useModalStore } from '@src/store';
import { uploadAudio, analyzeAudio } from '@src/api';


function InputSignalBlock()
{
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
		if (selectedFile)
		{
			setFile(selectedFile);
			setUploadedFileName(null);
			setState('file_ready');
		}
	};
	
	const handleRemoveFile = () => {
		setFile(null);
		setUploadedFileName(null);
		setState('idle');
		if (fileInputRef.current)
		{
			fileInputRef.current.value = '';
		}
	};
	
	const handleAnalyze = async () => {
		if (!file) return;
		setState('analyzing');
		
		abortControllerRef.current = new AbortController();
		const signal = abortControllerRef.current.signal;
		
		try
		{
			if (!uploadedFileName)
			{
				const uploadResult = await uploadAudio(file);
				
				if (signal.aborted) return;
				
				setUploadedFileName(uploadResult.fileName);
				
				await analyzeAudio(uploadResult.fileName);
				
				if (signal.aborted) return;
			}
			else
			{
				await analyzeAudio(uploadedFileName);
				
				if (signal.aborted) return;
			}
			
			setResultPresence();
			setState('file_ready');
		}
		catch (err)
		{
			if (err.message !== 'Аналіз скасовано')
			{
				showModal('Audio analysis error', { text: err.message || 'Unknown error' });
			}
			setState('file_ready');
		}
		finally
		{
			abortControllerRef.current = null;
		}
	};
	
	const handleCancel = () => {
		if (abortControllerRef.current)
		{
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