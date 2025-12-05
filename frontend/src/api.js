const apiBaseUrl = "http://localhost:3000";


async function uploadAudio(file)
{
	try
	{
		const formData = new FormData();
		formData.append('audio', file);
		const res = await fetch(apiBaseUrl + '/api/upload', {
			method: 'POST',
			body: formData,
		});
		if (!res.ok)
		{
			const error = await res.json();
			throw new Error(error.error || 'Помилка завантаження файлу');
		}
		return await res.json();
	}
	catch (err)
	{
		console.error('uploadAudio error:', err);
		throw err;
	}
}

async function analyzeAudio(fileName)
{
	try
	{
		const res = await fetch(apiBaseUrl + '/api/analysis', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ fileName }),
		});
		if (!res.ok)
		{
			const error = await res.json();
			throw new Error(error.error || 'Помилка аналізу файлу');
		}
		return await res.json();
	}
	catch (err)
	{
		console.error('analyzeAudio error:', err);
		throw err;
	}
}

async function exportPDF(data)
{
	try
	{
		const res = await fetch(apiBaseUrl + '/api/export/pdf', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!res.ok)
		{
			const error = await res.json();
			throw new Error(error.error || 'Помилка експорту PDF');
		}
		return await res.blob();
	}
	catch (err)
	{
		console.error('exportPDF error:', err);
		throw err;
	}
}

async function exportPNG(data)
{
	try
	{
		const res = await fetch(apiBaseUrl + '/api/export/png', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!res.ok)
		{
			const error = await res.json();
			throw new Error(error.error || 'Помилка експорту PNG ZIP');
		}
		return await res.blob();
	}
	catch (err)
	{
		console.error('exportPNG error:', err);
		throw err;
	}
}


console.log('API ready, base URL:', apiBaseUrl);


export { uploadAudio, analyzeAudio, exportPDF, exportPNG };