import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalComponent = ({ wsUrl, welcomeMessage = "Connecting to Secure Sandbox...\r\n" }) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!wsUrl) return;

        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#0a0a0a',
                foreground: '#c6ff33',
                cursor: '#c6ff33',
                selection: 'rgba(198, 255, 51, 0.3)',
            },
            fontFamily: 'JetBrains Mono, Menlo, Courier New, monospace',
            fontSize: 14,
            lineHeight: 1.2,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        term.write(welcomeMessage);

        // Connect WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        const socket = new WebSocket(`${protocol}//${host}${wsUrl}`);

        wsRef.current = socket;

        socket.onmessage = (event) => {
            term.write(event.data);
        };

        socket.onclose = () => {
            term.writeln('\r\n\x1b[31m[Disconnected from Sandbox]\x1b[0m');
        };

        socket.onerror = (err) => {
            term.writeln('\r\n\x1b[31m[WebSocket Error]\x1b[0m');
            console.error("Terminal WS Error:", err);
        };

        term.onData(data => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.close();
            term.dispose();
        };
    }, [wsUrl]);

    return (
        <div
            ref={terminalRef}
            className="w-full h-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl"
            style={{ minHeight: '400px' }}
        />
    );
};

export default TerminalComponent;
