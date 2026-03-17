import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalComponent = ({ wsUrl, welcomeMessage = "Connecting to secure sandbox …\r\n" }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!wsUrl || !containerRef.current) return;

        // ── disposed flag ──────────────────────────────────────────────────
        // Prevents post-cleanup callbacks (ResizeObserver, setTimeout) from
        // calling fitAddon.fit() after term.dispose() — which crashes xterm
        // with "Cannot read properties of undefined (reading 'dimensions')".
        // This also handles React 18 StrictMode's double-mount pattern.
        let disposed = false;

        // Clear any leftover DOM from a previous mount (StrictMode safe)
        containerRef.current.innerHTML = '';

        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background:    '#0a0a0a',
                foreground:    '#c6ff33',
                cursor:        '#c6ff33',
                cursorAccent:  '#0a0a0a',
                selection:     'rgba(198,255,51,0.25)',
                black:         '#0a0a0a',
                brightBlack:   '#3a3a3a',
                red:           '#ff5f57',
                brightRed:     '#ff5f57',
                green:         '#5af78e',
                brightGreen:   '#5af78e',
                yellow:        '#f3f99d',
                brightYellow:  '#f3f99d',
                blue:          '#57c7ff',
                brightBlue:    '#57c7ff',
                magenta:       '#ff6ac1',
                brightMagenta: '#ff6ac1',
                cyan:          '#9aedfe',
                brightCyan:    '#9aedfe',
                white:         '#f1f1f0',
                brightWhite:   '#eff0eb',
            },
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, 'Courier New', monospace",
            fontSize: 13,
            lineHeight: 1.4,
            letterSpacing: 0.3,
            scrollback: 2000,
            convertEol: true,
            allowTransparency: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(containerRef.current);

        // ── safe fit helper ───────────────────────────────────────────────
        const safeFit = () => {
            if (disposed) return;
            if (!containerRef.current) return;
            if (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) return;
            try { fitAddon.fit(); } catch (_) {}
        };

        // Initial fit: defer 50ms so flex layout has settled.
        // ResizeObserver alone is not enough for the very first render because
        // the observer fires synchronously during attach before CSS is applied.
        const initialFitTimer = setTimeout(safeFit, 50);

        // ── ResizeObserver for all subsequent resizes ─────────────────────
        const ro = new ResizeObserver(safeFit);
        ro.observe(containerRef.current);

        // ── welcome message ───────────────────────────────────────────────
        term.write(welcomeMessage);

        // ── WebSocket connection ──────────────────────────────────────────
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host     = window.location.hostname === 'localhost'
            ? 'localhost:8000'
            : window.location.host;
        const socket   = new WebSocket(`${protocol}//${host}${wsUrl}`);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => {
            term.write('\x1b[32mConexión establecida con éxito.\x1b[0m\r\n');
            // Auto-focus so the user can type immediately
            term.focus();
            // Refit now that socket is open (container might have shifted)
            safeFit();
        };

        socket.onmessage = (event) => {
            if (disposed) return;
            if (typeof event.data === 'string') {
                term.write(event.data);
            } else {
                term.write(new TextDecoder('utf-8').decode(event.data));
            }
        };

        socket.onclose = () => {
            if (disposed) return;
            term.writeln('\r\n\x1b[31m[Disconnected from Sandbox]\x1b[0m');
        };

        socket.onerror = () => {
            // Only log in dev — the onclose will show the UI message
            if (import.meta.env.DEV) console.warn('[Terminal] WebSocket error');
        };

        term.onData(data => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(new TextEncoder().encode(data));
            }
        });

        // Click on terminal to focus xterm
        const onContainerClick = () => term.focus();
        containerRef.current.addEventListener('click', onContainerClick);

        // ── cleanup ───────────────────────────────────────────────────────
        return () => {
            disposed = true;
            clearTimeout(initialFitTimer);
            ro.disconnect();
            containerRef.current?.removeEventListener('click', onContainerClick);
            socket.close();
            term.dispose();
        };
    }, [wsUrl]); // re-run only when the WS URL changes

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ minHeight: 0 }}
        />
    );
};

export default TerminalComponent;
