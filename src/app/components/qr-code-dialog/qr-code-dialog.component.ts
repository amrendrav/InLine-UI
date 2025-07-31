import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';

export interface QRCodeDialogData {
  url: string;
  businessName: string;
}

@Component({
  selector: 'app-qr-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="qr-dialog-container">
      <div class="qr-dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>qr_code</mat-icon>
          Waitlist QR Code
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="qr-dialog-content">
        <div class="qr-code-container" #printArea>
          <div class="business-header">
            <h3>{{ data.businessName }}</h3>
            <p>Scan to join our waitlist</p>
          </div>
          
          <div class="qr-code-wrapper">
            <canvas #qrCanvas class="qr-canvas"></canvas>
          </div>
          
          <div class="link-info">
            <p class="link-text">{{ data.url }}</p>
            <div class="instructions">
              <mat-icon>smartphone</mat-icon>
              <span>Point your phone camera at the QR code or visit the link above</span>
            </div>
          </div>
          
          <div class="print-footer">
            <p>Powered by InLine Waitlist Management System</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="qr-dialog-actions">
        <button mat-button (click)="copyLink()">
          <mat-icon>content_copy</mat-icon>
          Copy Link
        </button>
        <button mat-raised-button color="primary" (click)="printQR()">
          <mat-icon>print</mat-icon>
          Print QR Code
        </button>
        <button mat-raised-button color="accent" (click)="downloadQR()">
          <mat-icon>download</mat-icon>
          Download
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .qr-dialog-container {
      width: 100%;
      max-width: 550px;
      min-width: 420px;
      min-height: 650px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .qr-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 4px 4px 0 0;
    }

    .qr-dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: white;
      font-weight: 500;
      font-size: 20px;
    }

    .qr-dialog-header button {
      color: white;
    }

    .qr-dialog-content {
      padding: 32px 24px;
      text-align: center;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-code-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #f0f0f0;
      width: 100%;
      max-width: 350px;
    }

    .business-header {
      margin-bottom: 28px;
    }

    .business-header h3 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .business-header p {
      margin: 0;
      color: #7f8c8d;
      font-size: 15px;
      font-weight: 400;
    }

    .qr-code-wrapper {
      margin: 28px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .qr-canvas {
      width: 220px;
      height: 220px;
      border: 3px solid #ecf0f1;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      background: white;
    }

    .link-info {
      margin-top: 28px;
    }

    .link-text {
      font-size: 11px;
      color: #555;
      word-break: break-all;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 12px 16px;
      border-radius: 8px;
      margin: 0 0 20px 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      border: 1px solid #dee2e6;
      line-height: 1.4;
    }

    .instructions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 13px;
      color: #6c757d;
      margin: 0;
      font-weight: 500;
    }

    .instructions mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #667eea;
    }

    .print-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      font-size: 10px;
      color: #adb5bd;
    }

    .print-footer p {
      margin: 0;
      font-style: italic;
    }

    .qr-dialog-actions {
      padding: 20px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: center;
      background: #fafbfc;
      border-radius: 0 0 4px 4px;
    }

    .qr-dialog-actions button {
      min-width: 120px;
      font-weight: 500;
      text-transform: none;
      border-radius: 6px;
    }

    /* Print styles */
    @media print {
      .qr-dialog-header,
      .qr-dialog-actions {
        display: none !important;
      }

      .qr-dialog-content {
        padding: 0;
        margin: 0;
        display: block;
      }

      .qr-code-container {
        box-shadow: none;
        border: 2px solid #000;
        border-radius: 8px;
        page-break-inside: avoid;
        margin: 30px auto;
        padding: 40px;
        max-width: none;
        width: auto;
        background: white !important;
      }

      .business-header {
        margin-bottom: 30px;
      }

      .business-header h3 {
        font-size: 28px;
        color: #000 !important;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .business-header p {
        font-size: 18px;
        color: #333 !important;
        font-weight: 400;
      }

      .qr-code-wrapper {
        margin: 30px 0;
      }

      .qr-canvas {
        width: 250px !important;
        height: 250px !important;
        border: 3px solid #000;
        border-radius: 8px;
      }

      .link-info {
        margin-top: 30px;
      }

      .link-text {
        color: #000 !important;
        background: #f8f8f8 !important;
        font-size: 14px;
        border: 2px solid #ccc;
        padding: 15px;
        font-weight: 500;
      }

      .instructions {
        color: #333 !important;
        font-size: 16px;
        font-weight: 500;
        margin-top: 20px;
      }

      .instructions mat-icon {
        color: #333 !important;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .print-footer {
        border-top: 2px solid #333;
        color: #666 !important;
        font-size: 14px;
        margin-top: 30px;
        padding-top: 20px;
      }
    }

    /* Responsive styles */
    @media (max-width: 600px) {
      .qr-dialog-container {
        max-width: 100%;
        min-width: 300px;
        min-height: auto;
        max-height: 95vh;
      }

      .qr-dialog-content {
        padding: 16px 12px;
        flex: 1;
        overflow-y: auto;
      }

      .qr-code-container {
        padding: 20px 16px;
        max-width: none;
      }

      .business-header {
        margin-bottom: 20px;
      }

      .business-header h3 {
        font-size: 18px;
        margin-bottom: 8px;
      }

      .business-header p {
        font-size: 13px;
      }

      .qr-code-wrapper {
        margin: 20px 0;
      }

      .qr-canvas {
        width: 160px;
        height: 160px;
      }

      .link-info {
        margin-top: 20px;
      }

      .link-text {
        font-size: 9px;
        padding: 8px 10px;
        margin-bottom: 15px;
      }

      .instructions {
        font-size: 11px;
        gap: 8px;
      }

      .print-footer {
        margin-top: 16px;
        padding-top: 16px;
        font-size: 9px;
      }

      .qr-dialog-actions {
        padding: 12px 16px;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
      }

      .qr-dialog-actions button {
        width: 100%;
        max-width: 280px;
        min-width: auto;
        padding: 12px 16px;
        font-size: 14px;
      }
    }

    @media (min-width: 601px) {
      .qr-dialog-container {
        min-width: 420px;
        max-width: 550px;
      }
    }

    @media (max-width: 480px) {
      .qr-dialog-header {
        padding: 10px 16px;
      }

      .qr-dialog-header h2 {
        font-size: 16px;
      }

      .qr-dialog-content {
        padding: 12px 10px;
      }

      .qr-code-container {
        padding: 16px 12px;
      }

      .business-header h3 {
        font-size: 16px;
      }

      .business-header p {
        font-size: 12px;
      }

      .qr-canvas {
        width: 140px;
        height: 140px;
      }

      .link-text {
        font-size: 8px;
        padding: 6px 8px;
      }

      .instructions {
        font-size: 10px;
      }

      .qr-dialog-actions {
        padding: 10px 12px;
        align-items: center;
        justify-content: center;
      }

      .qr-dialog-actions button {
        padding: 10px 12px;
        font-size: 13px;
        max-width: 260px;
      }
    }
  `]
})
export class QRCodeDialogComponent implements OnInit {
  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('printArea', { static: true }) printArea!: ElementRef<HTMLDivElement>;

  constructor(
    public dialogRef: MatDialogRef<QRCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QRCodeDialogData,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.generateQRCode();
  }

  private async generateQRCode(): Promise<void> {
    try {
      const canvas = this.qrCanvas.nativeElement;
      await QRCode.toCanvas(canvas, this.data.url, {
        width: 220,
        margin: 2,
        color: {
          dark: '#2c3e50',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.snackBar.open('Failed to generate QR code', 'Close', { duration: 3000 });
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.data.url).then(() => {
      this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy link', 'Close', { duration: 2000 });
    });
  }

  printQR(): void {
    try {
      // Convert canvas to image data URL
      const canvas = this.qrCanvas.nativeElement;
      const qrImageData = canvas.toDataURL('image/png');
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Waitlist QR Code - ${this.data.businessName}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  text-align: center;
                  background: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .print-container {
                  max-width: 500px;
                  margin: 0 auto;
                  background: white;
                  border: 3px solid #000;
                  border-radius: 12px;
                  padding: 30px;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .business-header h3 {
                  margin: 0 0 10px 0;
                  color: #000;
                  font-size: 28px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .business-header p {
                  margin: 0 0 30px 0;
                  color: #333;
                  font-size: 18px;
                  font-weight: 500;
                }
                .qr-image-wrapper {
                  margin: 30px 0;
                  display: flex;
                  justify-content: center;
                }
                .qr-image {
                  width: 220px;
                  height: 220px;
                  border: 3px solid #000;
                  border-radius: 12px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                .link-text {
                  font-size: 16px;
                  color: #000;
                  word-break: break-all;
                  background-color: #f5f5f5;
                  padding: 12px;
                  border-radius: 8px;
                  margin: 25px 0;
                  font-family: 'Courier New', monospace;
                  border: 2px solid #ddd;
                  line-height: 1.4;
                }
                .instructions {
                  font-size: 16px;
                  color: #000;
                  margin: 20px 0 0 0;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                }
                .phone-icon {
                  width: 20px;
                  height: 20px;
                  fill: #000;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #eee;
                  font-size: 14px;
                  color: #666;
                }
                
                @media print {
                  body {
                    margin: 0;
                    padding: 15px;
                  }
                  .print-container {
                    box-shadow: none;
                    border: 2px solid #000;
                    page-break-inside: avoid;
                  }
                  .qr-image {
                    border: 2px solid #000;
                  }
                  .link-text {
                    border: 1px solid #000;
                    background-color: #f8f8f8 !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="business-header">
                  <h3>${this.data.businessName}</h3>
                  <p>Scan to join our waitlist</p>
                </div>
                
                <div class="qr-image-wrapper">
                  <img src="${qrImageData}" alt="QR Code" class="qr-image" />
                </div>
                
                <div class="link-info">
                  <div class="link-text">${this.data.url}</div>
                  <div class="instructions">
                    <svg class="phone-icon" viewBox="0 0 24 24">
                      <path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z" />
                    </svg>
                    Point your phone camera at the QR code or visit the link above
                  </div>
                </div>
                
                <div class="footer">
                  <p>Powered by InLine Waitlist Management System</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for the image to load before printing
        setTimeout(() => {
          printWindow.print();
          // Don't auto-close so user can print again if needed
        }, 500);
      }
    } catch (error) {
      console.error('Error creating print window:', error);
      this.snackBar.open('Failed to create printable version', 'Close', { duration: 3000 });
    }
  }

  downloadQR(): void {
    try {
      // Get the print area element which contains the full content
      const printArea = this.printArea.nativeElement;
      const canvas = this.qrCanvas.nativeElement;
      
      // Create a temporary canvas to draw the complete content
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size (adjust as needed)
      tempCanvas.width = 600;
      tempCanvas.height = 800;
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Add border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, tempCanvas.width - 20, tempCanvas.height - 20);
      
      // Business name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      const businessName = this.data.businessName.toUpperCase();
      ctx.fillText(businessName, tempCanvas.width / 2, 80);
      
      // Subtitle
      ctx.font = '20px Arial';
      ctx.fillStyle = '#333333';
      ctx.fillText('Scan to join our waitlist', tempCanvas.width / 2, 120);
      
      // Draw QR code
      const qrImageData = canvas.toDataURL('image/png');
      const qrImage = new Image();
      
      qrImage.onload = () => {
        // Draw QR code centered
        const qrSize = 250;
        const qrX = (tempCanvas.width - qrSize) / 2;
        const qrY = 160;
        
        // QR code border
        ctx.fillStyle = '#000000';
        ctx.fillRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        
        // Draw QR code
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
        
        // URL text
        const urlY = qrY + qrSize + 60;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(50, urlY - 25, tempCanvas.width - 100, 40);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, urlY - 25, tempCanvas.width - 100, 40);
        
        ctx.fillStyle = '#000000';
        ctx.font = '14px monospace';
        
        // Split URL if too long
        const url = this.data.url;
        const maxWidth = tempCanvas.width - 120;
        const urlWords = url.split('');
        let line = '';
        let lineY = urlY;
        
        for (let n = 0; n < urlWords.length; n++) {
          const testLine = line + urlWords[n];
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, tempCanvas.width / 2, lineY);
            line = urlWords[n];
            lineY += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, tempCanvas.width / 2, lineY);
        
        // Instructions
        const instructionY = urlY + 80;
        ctx.font = '18px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText('📱 Point your phone camera at the QR code', tempCanvas.width / 2, instructionY);
        ctx.fillText('or visit the link above', tempCanvas.width / 2, instructionY + 25);
        
        // Footer
        const footerY = tempCanvas.height - 40;
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, footerY - 20);
        ctx.lineTo(tempCanvas.width - 100, footerY - 20);
        ctx.stroke();
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('Powered by InLine Waitlist Management System', tempCanvas.width / 2, footerY);
        
        // Download the complete image
        const link = document.createElement('a');
        link.download = `${this.data.businessName.replace(/\s+/g, '_')}_waitlist_complete.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        this.snackBar.open('Complete QR code page downloaded!', 'Close', { duration: 2000 });
      };
      
      qrImage.onerror = () => {
        // Fallback: download just the QR code if image loading fails
        const canvas = this.qrCanvas.nativeElement;
        const link = document.createElement('a');
        link.download = `${this.data.businessName.replace(/\s+/g, '_')}_waitlist_qr.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        this.snackBar.open('QR code downloaded!', 'Close', { duration: 2000 });
      };
      
      qrImage.src = qrImageData;
      
    } catch (error) {
      console.error('Error downloading complete QR page:', error);
      this.snackBar.open('Failed to download QR page', 'Close', { duration: 3000 });
    }
  }
}
