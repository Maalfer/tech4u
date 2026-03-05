import React from 'react';
import { useAuth } from '../context/AuthContext';
import PhaserGameWrapper from '../components/PhaserGameWrapper';

export default function VirtualWorldView() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-[#020510] overflow-hidden flex items-center justify-center font-sans select-none">
            <PhaserGameWrapper user={user} />
        </div>
    );
}
