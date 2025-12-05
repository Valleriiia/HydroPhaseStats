import { createRoot } from 'react-dom/client';

import Main from '/src/Main.jsx';
import { StrictMode } from 'react';


const root = createRoot(document.getElementById('main'));
root.render(<StrictMode>
	<Main/>
</StrictMode>);