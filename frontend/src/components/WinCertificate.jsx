import { useEffect, useRef } from 'react';
import { X, Download, Share2 } from 'lucide-react';

function drawCertificate(canvas, { studentName, moduleName, moduleIcon, completionDate, xp }) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = '#0A0A0F';
  ctx.fillRect(0, 0, W, H);

  // Outer border gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0ea5e9');
  grad.addColorStop(0.5, '#8b5cf6');
  grad.addColorStop(1, '#0ea5e9');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Inner border
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // Top glow
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.5);
  glow.addColorStop(0, 'rgba(14,165,233,0.12)');
  glow.addColorStop(1, 'rgba(14,165,233,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = 'rgba(14,165,233,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // TECH4U logo text
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = 'rgba(14,165,233,0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('TECH4U ACADEMY', W / 2, 65);

  // Certificate title
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('CERTIFICADO DE FINALIZACIÓN', W / 2, 100);

  // Decorative line
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 180, 115); ctx.lineTo(W / 2 + 180, 115); ctx.stroke();

  // "This is to certify that"
  ctx.font = '14px serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Se certifica que', W / 2, 148);

  // Student name
  ctx.font = 'bold 36px serif';
  const nameGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  nameGrad.addColorStop(0, '#e2e8f0');
  nameGrad.addColorStop(0.5, '#ffffff');
  nameGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = nameGrad;
  ctx.fillText(studentName || 'Alumno', W / 2, 200);

  // "has completed"
  ctx.font = '14px serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('ha completado satisfactoriamente el módulo', W / 2, 235);

  // Module icon + name box
  const boxW = 360, boxH = 60;
  const boxX = (W - boxW) / 2;
  const boxY = 255;
  const moduleGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY);
  moduleGrad.addColorStop(0, 'rgba(14,165,233,0.08)');
  moduleGrad.addColorStop(0.5, 'rgba(139,92,246,0.12)');
  moduleGrad.addColorStop(1, 'rgba(14,165,233,0.08)');
  ctx.fillStyle = moduleGrad;
  ctx.strokeStyle = 'rgba(139,92,246,0.3)';
  ctx.lineWidth = 1;
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(boxX + r, boxY); ctx.lineTo(boxX + boxW - r, boxY);
  ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
  ctx.lineTo(boxX + boxW, boxY + boxH - r);
  ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
  ctx.lineTo(boxX + r, boxY + boxH);
  ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
  ctx.lineTo(boxX, boxY + r);
  ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Module icon
  ctx.font = '26px serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(moduleIcon || '🏆', W / 2 - 90, boxY + 40);

  // Module name
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'left';
  ctx.fillText(moduleName || 'Windows Server 2022', boxX + 90, boxY + 28);
  ctx.font = '11px monospace';
  ctx.fillStyle = 'rgba(139,92,246,0.8)';
  ctx.fillText(`Windows Server 2022  ·  TECH4U`, boxX + 90, boxY + 48);

  // XP badge
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`+${xp || 0} XP`, W / 2, 360);

  // Date
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText(`Emitido el ${completionDate || new Date().toLocaleDateString('es-ES')}`, W / 2, 385);

  // Bottom decorative line + seal text
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 180, 403); ctx.lineTo(W / 2 + 180, 403); ctx.stroke();

  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillText('tech4uacademy.es  ·  Certificado verificable  ·  Formación profesional TI', W / 2, 422);
}

export default function WinCertificate({ isOpen, onClose, moduleName, moduleIcon, xp, studentName }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 700;
    canvas.height = 450;
    drawCertificate(canvas, {
      studentName: studentName || 'Alumno',
      moduleName,
      moduleIcon,
      xp,
      completionDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }, [isOpen, moduleName, studentName, xp]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `certificado-${moduleName?.replace(/\s/g, '-').toLowerCase() || 'modulo'}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-[#0D0D0D] overflow-hidden shadow-2xl shadow-black/60">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-black font-mono text-white">Certificado de módulo</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Certificate canvas */}
        <div className="p-6">
          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-xl">
            <canvas ref={canvasRef} className="w-full" style={{ display: 'block' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-sm font-bold transition-all shadow-lg shadow-sky-900/30">
            <Download className="w-4 h-4" /> Descargar PNG
          </button>
          <button onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white font-mono text-sm transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
