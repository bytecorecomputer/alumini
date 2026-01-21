import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import logo from '../../assets/format/logo.png';

const CertificateTemplate = forwardRef(({ data }, ref) => {
    const {
        studentName = '',
        fatherName = '',
        motherName = '',
        courseName = '',
        duration = '',
        marksheetNumber = '',
        certificateNumber = '',
        issueDate = '',
        studentPhoto = null,
        subjects = [],
        totalMarks = 0,
        obtainedMarks = 0,
        percentage = 0,
        grade = '',
        division = '',
    } = data;

    return (
        <div
            ref={ref}
            className="certificate-container"
            style={{
                width: '210mm',
                height: '297mm',
                padding: '12mm',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)',
                fontFamily: "'Times New Roman', serif",
                position: 'relative',
                boxSizing: 'border-box',
                overflow: 'hidden', // Prevent watermark overflow
            }}
        >
            {/* Watermark */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-30deg)',
                width: '650px',
                height: '650px',
                backgroundImage: `url(${logo})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                opacity: '0.1',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* Decorative Corners */}
            <div style={{
                position: 'absolute',
                top: '8mm',
                left: '8mm',
                width: '30mm',
                height: '30mm',
                borderTop: '5px solid #1e3a8a',
                borderLeft: '5px solid #1e3a8a',
                borderRadius: '8px 0 0 0',
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                top: '8mm',
                right: '8mm',
                width: '30mm',
                height: '30mm',
                borderTop: '5px solid #1e3a8a',
                borderRight: '5px solid #1e3a8a',
                borderRadius: '0 8px 0 0',
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                bottom: '8mm',
                left: '8mm',
                width: '30mm',
                height: '30mm',
                borderBottom: '5px solid #1e3a8a',
                borderLeft: '5px solid #1e3a8a',
                borderRadius: '0 0 0 8px',
                zIndex: 1,
            }} />
            <div style={{
                position: 'absolute',
                bottom: '8mm',
                right: '8mm',
                width: '30mm',
                height: '30mm',
                borderBottom: '5px solid #1e3a8a',
                borderRight: '5px solid #1e3a8a',
                borderRadius: '0 0 8px 0',
                zIndex: 1,
            }} />

            {/* Main Border */}
            <div style={{
                position: 'absolute',
                top: '9mm',
                left: '9mm',
                right: '9mm',
                bottom: '9mm',
                border: '3px solid #3b82f6',
                borderRadius: '6px',
                zIndex: 2,
            }}>
                <div style={{
                    position: 'absolute',
                    top: '3mm',
                    left: '3mm',
                    right: '3mm',
                    bottom: '3mm',
                    border: '2px solid #93c5fd',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '8mm',
                    boxShadow: 'inset 0 0 30px rgba(59, 130, 246, 0.1)',
                }}>
                    {/* Header Section */}
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            marginBottom: '8px',
                        }}>
                            {/* Logo */}
                            <img
                                src={logo}
                                alt="ByteCore Logo"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                                }}
                            />

                            <div>
                                <h1 style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: '#1e3a8a',
                                    margin: '0',
                                    letterSpacing: '2px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                    fontFamily: "'Times New Roman', serif",
                                    lineHeight: '1.1',
                                }}>
                                    BYTECORE COMPUTER CENTRE
                                </h1>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#475569',
                                    margin: '6px 0 0 0',
                                    fontWeight: '700',
                                    letterSpacing: '0.5px',
                                }}>
                                    (BYTECORE EDUCATIONAL SOCIETY)
                                </p>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    margin: '4px 0 0 0',
                                }}>
                                    Add.: Nariyawal, Bareilly | REGD. NO. BAR/07758
                                </p>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    margin: '3px 0 0 0',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                }}>
                                    UDYAM REGISTRATION NO.: UDYAM-UP-XX-XXXXXXX
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Numbers and Photo Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '15px',
                        marginBottom: '10px',
                        fontSize: '10.5px',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                marginBottom: '4px',
                                padding: '6px 12px',
                                background: 'linear-gradient(to right, #eff6ff, transparent)',
                                borderLeft: '3px solid #3b82f6',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>Marksheet No:</strong> {marksheetNumber}
                            </div>
                            <div style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(to right, #eff6ff, transparent)',
                                borderLeft: '3px solid #3b82f6',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>Certificate No:</strong> {certificateNumber}
                            </div>
                        </div>

                        {/* Student Photo - Using img tag for better PDF capture */}
                        <div style={{
                            width: '85px',
                            height: '105px',
                            border: '3px solid #1e3a8a',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                        }}>
                            {studentPhoto ? (
                                <img
                                    src={studentPhoto}
                                    alt="Student"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '10px' }}>Photo</span>
                            )}
                        </div>
                    </div>

                    {/* Title Banner */}
                    <div style={{
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)',
                    }}>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            margin: '0',
                            letterSpacing: '4px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        }}>
                            MARKSHEET CUM DIPLOMA
                        </h2>
                    </div>

                    {/* Student Details Section */}
                    <div style={{ marginBottom: '10px', fontSize: '11.5px', lineHeight: '1.8' }}>
                        <div style={{ display: 'flex', marginBottom: '6px' }}>
                            <span style={{ width: '180px', fontWeight: '600', color: '#334155' }}>Diploma Issued Year:</span>
                            <span style={{
                                flex: 1,
                                borderBottom: '2px dotted #94a3b8',
                                paddingLeft: '10px',
                                fontWeight: 'bold',
                                color: '#1e3a8a',
                            }}>
                                {issueDate}
                            </span>
                        </div>

                        <div style={{ display: 'flex', marginBottom: '6px' }}>
                            <span style={{ width: '180px', fontWeight: '600', color: '#334155' }}>This is Certified that Mr./Mrs.:</span>
                            <span style={{
                                flex: 1,
                                borderBottom: '2px dotted #94a3b8',
                                paddingLeft: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                color: '#dc2626',
                                fontSize: '12px',
                            }}>
                                {studentName}
                            </span>
                        </div>

                        <div style={{ display: 'flex', marginBottom: '6px' }}>
                            <span style={{ width: '180px', fontWeight: '600', color: '#334155' }}>Father Name/Husband Name:</span>
                            <span style={{
                                flex: 1,
                                borderBottom: '2px dotted #94a3b8',
                                paddingLeft: '10px',
                                textTransform: 'uppercase',
                                color: '#1e3a8a',
                            }}>
                                {fatherName}
                            </span>
                        </div>

                        <div style={{ display: 'flex', marginBottom: '6px' }}>
                            <span style={{ width: '180px', fontWeight: '600', color: '#334155' }}>Mother Name:</span>
                            <span style={{
                                flex: 1,
                                borderBottom: '2px dotted #94a3b8',
                                paddingLeft: '10px',
                                textTransform: 'uppercase',
                                color: '#1e3a8a',
                            }}>
                                {motherName}
                            </span>
                        </div>

                        <div style={{ display: 'flex', marginBottom: '6px' }}>
                            <span style={{ width: '180px', fontWeight: '600', color: '#334155' }}>HAS SUCCESSFULLY COMPLETED:</span>
                            <span style={{
                                flex: 1,
                                borderBottom: '2px dotted #94a3b8',
                                paddingLeft: '10px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                color: '#059669',
                                fontSize: '12px',
                            }}>
                                {courseName}
                            </span>
                        </div>

                        <div style={{ marginBottom: '8px', marginTop: '8px', fontSize: '11px', color: '#475569' }}>
                            OUR INSTITUTE COURSE DURATION IS <strong style={{ color: '#1e3a8a', fontSize: '12px' }}>{duration}</strong>
                        </div>

                        <div style={{
                            fontSize: '10.5px',
                            marginBottom: '10px',
                            padding: '6px',
                            background: 'linear-gradient(to right, #fef3c7, transparent)',
                            borderLeft: '3px solid #f59e0b',
                            color: '#78350f',
                            fontWeight: '600',
                        }}>
                            WE ARE ISSUING A MARK SHEET OBTAINED BY YOU IN COMPUTER BASED TEST EXAM BY OUR INSTITUTE ASSESSMENT:
                        </div>
                    </div>

                    {/* Marks Table */}
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginBottom: '10px',
                        fontSize: '10.5px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                        <thead>
                            <tr style={{
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                color: 'white'
                            }}>
                                <th style={{ border: '1px solid #1e3a8a', padding: '8px', textAlign: 'center', fontSize: '11px' }}>S. No.</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '8px', textAlign: 'left', fontSize: '11px' }}>Subject Name</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '8px', textAlign: 'center', fontSize: '11px' }}>Exam Type</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '8px', textAlign: 'center', fontSize: '11px' }} colSpan="2">Total Marks</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '8px', textAlign: 'center', fontSize: '11px' }}>OBTAIN MARKS</th>
                            </tr>
                            <tr style={{ background: '#eff6ff' }}>
                                <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}></th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}></th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}></th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a' }}>MAX</th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', fontWeight: 'bold', color: '#1e3a8a' }}>MIN</th>
                                <th style={{ border: '1px solid #cbd5e1', padding: '5px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={index} style={{
                                    background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                                }}>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '7px', textAlign: 'center', fontWeight: 'bold' }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '7px', fontWeight: '600', color: '#334155' }}>
                                        {subject.name}
                                    </td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '7px', textAlign: 'center', color: '#64748b' }}>
                                        {subject.type}
                                    </td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '7px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                                        {subject.maxMarks}
                                    </td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '7px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                                        {subject.minMarks}
                                    </td>
                                    <td style={{
                                        border: '1px solid #cbd5e1',
                                        padding: '7px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        color: '#059669',
                                        background: '#f0fdf4',
                                    }}>
                                        {subject.obtained}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary and QR Section - Redesigned without boxes */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 1fr',
                        gap: '15px',
                        fontSize: '11px',
                        marginBottom: '10px',
                    }}>
                        <div>
                            {/* Unified Summary Strip */}
                            <div style={{
                                marginTop: '10px',
                                marginBottom: '15px',
                                padding: '12px 16px',
                                background: '#f0f9ff',
                                borderRadius: '8px',
                                border: '1px solid #bae6fd',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                color: '#1e3a8a',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>Total Marks</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800' }}>
                                        <span style={{ color: '#dc2626' }}>{obtainedMarks}</span> / {totalMarks}
                                    </div>
                                </div>
                                <div style={{ height: '30px', width: '1px', background: '#cbd5e1' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>Percentage</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#92400e' }}>
                                        {percentage.toFixed(2)}%
                                    </div>
                                </div>
                                <div style={{ height: '30px', width: '1px', background: '#cbd5e1' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>Division</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>
                                        {division}
                                    </div>
                                </div>
                                <div style={{ height: '30px', width: '1px', background: '#cbd5e1' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>Grade</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#4338ca' }}>
                                        {grade}
                                    </div>
                                </div>
                            </div>


                            {/* Grading System Legend - Simple & Clean */}
                            <div style={{
                                marginTop: '12px',
                                padding: '8px',
                                background: '#f8fafc',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '4px',
                                fontSize: '9px',
                                color: '#475569',
                                textAlign: 'center'
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>GRADING SYSTEM:</strong>
                                <span style={{ marginLeft: '8px' }}> <strong style={{ color: '#059669' }}>A+</strong> (90% & Above) </span>
                                <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                                <span> <strong style={{ color: '#059669' }}>A</strong> (80%-89%) </span>
                                <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                                <span> <strong style={{ color: '#0891b2' }}>B+</strong> (70%-79%) </span>
                                <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                                <span> <strong style={{ color: '#0891b2' }}>B</strong> (60%-69%) </span>
                                <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                                <span> <strong style={{ color: '#d97706' }}>C</strong> (50%-59%) </span>
                                <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
                                <span> <strong style={{ color: '#dc2626' }}>D</strong> (40%-49%) </span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div style={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '10px',
                        }}>
                            <div style={{
                                padding: '6px',
                                background: 'white',
                                borderRadius: '8px',
                                border: '2px solid #3b82f6',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                            }}>
                                <QRCodeCanvas
                                    value={`STUDENT: ${studentName}\nFATHER: ${fatherName}\nCOURSE: ${courseName}\nMARKS: ${obtainedMarks}/${totalMarks} (${percentage.toFixed(2)}%)\nRESULT: ${division} (Grade ${grade})\nCERT NO: ${certificateNumber}`}
                                    size={90}
                                    level="M"
                                />
                            </div>
                            <div style={{
                                fontSize: '8px',
                                marginTop: '4px',
                                color: '#64748b',
                                fontWeight: 'bold',
                            }}>
                                Scan to Verify
                            </div>
                        </div>
                    </div>

                    {/* Footer - Signatures REMOVED */}
                    <div style={{
                        marginTop: '10px',
                        paddingTop: '5px',
                        height: '30px', /* Minimal Spacer */
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#cbd5e1',
                        fontSize: '9px',
                        letterSpacing: '1px'
                    }}>
                        {/* Optional: 'COMPUTER GENERATED CERTIFICATE' or keep empty */}
                        <span style={{ opacity: 0.5 }}></span>
                    </div>
                </div>
            </div>
        </div>
    );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
