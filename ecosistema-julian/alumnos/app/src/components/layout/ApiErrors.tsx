import React, { useEffect, useState } from 'react';
import { queryClient } from '../../lib/queryClient';
export function ApiErrors() { const [error, setError] = useState(''); useEffect(() => { const changed = (event: any) => { const e = event.query?.state.error ?? event.mutation?.state.error; if (e)
    setError(e.message); }; const q = queryClient.getQueryCache().subscribe(changed); const m = queryClient.getMutationCache().subscribe(changed); return () => { q(); m(); }; }, []); return error ? <div role="alert" className="p-4 border border-red-500"><p>{error}</p><button onClick={() => { setError(''); void queryClient.refetchQueries(); }}>Volver a cargar</button></div> : null; }
