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

            {/* Main Border - Double Line Style */}
            <div style={{
                position: 'absolute',
                top: '9mm',
                left: '9mm',
                right: '9mm',
                bottom: '9mm',
                border: '4px double #1e3a8a',
                borderRadius: '8px',
                zIndex: 2,
                padding: '1mm',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '2mm',
                    left: '2mm',
                    right: '2mm',
                    bottom: '2mm',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    padding: '8mm',
                    boxShadow: 'inset 0 0 40px rgba(59, 130, 246, 0.05)',
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
                                    margin: '3px 0 0 0',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                }}>
                                    (A UNIT OF BYTECORE EDUCATIONAL SOCIETY)
                                </p>
                                <p style={{
                                    fontSize: '10px',
                                    color: '#1e3a8a',
                                    margin: '4px 0 0 0',
                                    fontWeight: 'bold',
                                }}>
                                    AN ISO 9001:2015 CERTIFIED INSTITUTE | MSME REGISTERED
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
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center', fontSize: '12px', width: '60px' }}>S. No.</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'left', fontSize: '12px' }}>Subject Name</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center', fontSize: '12px', width: '120px' }}>MAX MARKS</th>
                                <th style={{ border: '1px solid #1e3a8a', padding: '10px', textAlign: 'center', fontSize: '12px', width: '150px' }}>OBTAIN MARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={index} style={{
                                    background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                                }}>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', fontWeight: '600', color: '#334155', textTransform: 'uppercase' }}>
                                        {subject.name}
                                    </td>
                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                                        {subject.maxMarks}
                                    </td>
                                    <td style={{
                                        border: '1px solid #cbd5e1',
                                        padding: '8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        color: '#059669',
                                        background: '#f0fdf4',
                                    }}>
                                        {subject.obtained}
                                    </td>
                                </tr>
                            ))}
                            {/* Grand Total Row */}
                            <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                                <td colSpan="2" style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right', fontSize: '14px', color: '#1e3a8a' }}>
                                    GRAND TOTAL
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1e3a8a' }}>
                                    {totalMarks}
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'center', fontSize: '16px', color: '#dc2626', background: '#fee2e2' }}>
                                    {obtainedMarks}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Obtained Total Text - Squared Style */}
                    <div style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        margin: '15px 0',
                        color: '#1e3a8a',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        padding: '10px',
                        border: '2px solid #3b82f6',
                        background: '#eff6ff'
                    }}>
                        YOUR OBTAINED TOTAL MARKS <span style={{ color: '#dc2626', fontSize: '18px', padding: '0 10px' }}>{obtainedMarks}</span> FROM <span style={{ padding: '0 10px' }}>{totalMarks}</span>
                    </div>

                    {/* Result Summary - Streamlined */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        marginBottom: '10px',
                        padding: '10px 20px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569'
                    }}>
                        <div>
                            <strong>RESULT STATUS:</strong> <span style={{
                                marginLeft: '8px',
                                color: division === 'Fail' ? '#dc2626' : '#059669',
                                fontWeight: '900',
                                textTransform: 'uppercase'
                            }}>
                                {division}
                            </span>
                        </div>
                        <div>
                            <strong>GRADE:</strong> <span style={{
                                marginLeft: '8px',
                                color: '#1e3a8a',
                                fontWeight: '900'
                            }}>{grade}</span>
                        </div>
                        <div>
                            <strong>PERCENTAGE:</strong> <span style={{
                                marginLeft: '8px',
                                color: '#1e3a8a',
                                fontWeight: '900'
                            }}>{percentage.toFixed(2)}%</span>
                        </div>
                    </div>


                    {/* Footer - Bottom Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 1fr 2fr',
                        gap: '20px',
                        alignItems: 'end',
                        marginTop: '15px'
                    }}>
                        {/* Grading Table */}
                        <div style={{ paddingBottom: '10px' }}>
                            <table style={{
                                width: '100%',
                                fontSize: '8px',
                                borderCollapse: 'collapse',
                                color: '#475569',
                                border: '1px solid #cbd5e1'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9' }}>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '2px' }}>PERCENTAGE</th>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '2px' }}>GRADE</th>
                                        <th style={{ border: '1px solid #cbd5e1', padding: '2px' }}>REMARK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>85% & ABOVE</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>A+</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>DISTINCTION</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>75% to 84%</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>A</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>EXCELLENT</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>60% to 74%</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>B</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>VERY GOOD</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>BELOW 40%</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>F</td>
                                        <td style={{ border: '1px solid #cbd5e1', padding: '2px', textAlign: 'center' }}>FAIL</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* QR Code */}
                        <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px',
                                background: 'white',
                                border: '1px solid #cbd5e1',
                            }}>
                                <QRCodeCanvas
                                    value={`STUDENT: ${studentName}\nCERT NO: ${certificateNumber}\nRESULT: ${division}`}
                                    size={60}
                                    level="M"
                                />
                            </div>
                            <div style={{ fontSize: '7px', marginTop: '2px', fontWeight: 'bold', color: '#64748b' }}>VERIFY ONLINE</div>
                        </div>

                        {/* Signature */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '10px',
                                fontWeight: '900',
                                color: '#1e3a8a',
                                marginBottom: '35px',
                                textTransform: 'uppercase',
                                fontStyle: 'italic'
                            }}>
                                ByteCore
                            </div>
                            <div style={{ borderBottom: '1px solid #1e3a8a', width: '100%' }}></div>
                            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>CENTRE HEAD</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
