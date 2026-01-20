import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

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
            }}
        >
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
                            gap: '12px',
                            marginBottom: '8px',
                        }}>
                            {/* Logo */}
                            <div style={{
                                width: '55px',
                                height: '55px',
                                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '22px',
                                fontWeight: 'bold',
                                border: '3px solid #1e3a8a',
                                boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)',
                            }}>
                                BC
                            </div>
                            <div>
                                <h1 style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: '#1e3a8a',
                                    margin: '0',
                                    letterSpacing: '2px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                }}>
                                    BYTECORE COMPUTER CENTRE
                                </h1>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#475569',
                                    margin: '4px 0 0 0',
                                    fontWeight: '600',
                                }}>
                                    (BYTECORE EDUCATIONAL SOCIETY)
                                </p>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    margin: '3px 0 0 0',
                                }}>
                                    Add.: Nariyawal, Bareilly | REGD. NO. BAR/07758
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
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                marginBottom: '4px',
                                padding: '4px 8px',
                                background: 'linear-gradient(to right, #eff6ff, transparent)',
                                borderLeft: '3px solid #3b82f6',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>Marksheet No:</strong> {marksheetNumber}
                            </div>
                            <div style={{
                                padding: '4px 8px',
                                background: 'linear-gradient(to right, #eff6ff, transparent)',
                                borderLeft: '3px solid #3b82f6',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>Certificate No:</strong> {certificateNumber}
                            </div>
                        </div>
                        <div style={{
                            width: '75px',
                            height: '95px',
                            border: '3px solid #1e3a8a',
                            background: studentPhoto ? `url(${studentPhoto})` : '#f1f5f9',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            fontSize: '10px',
                            borderRadius: '4px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        }}>
                            {!studentPhoto && 'Photo'}
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

                    {/* Summary and QR Section */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 1fr',
                        gap: '15px',
                        fontSize: '11px',
                        marginBottom: '12px',
                    }}>
                        <div>
                            <div style={{
                                marginBottom: '8px',
                                padding: '8px',
                                background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
                                borderRadius: '6px',
                                borderLeft: '4px solid #3b82f6',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>YOUR OBTAINED TOTAL MARKS:</strong>{' '}
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626' }}>{obtainedMarks}</span>
                                {' '}<strong style={{ color: '#1e3a8a' }}>FROM</strong>{' '}
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>{totalMarks}</span>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '8px',
                                marginBottom: '10px',
                            }}>
                                <div style={{
                                    padding: '6px',
                                    background: '#fef3c7',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    border: '2px solid #fbbf24',
                                }}>
                                    <div style={{ fontSize: '9px', color: '#78350f', marginBottom: '2px' }}>PERCENTAGE</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#92400e' }}>
                                        {percentage.toFixed(2)}%
                                    </div>
                                </div>
                                <div style={{
                                    padding: '6px',
                                    background: '#dcfce7',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    border: '2px solid #22c55e',
                                }}>
                                    <div style={{ fontSize: '9px', color: '#14532d', marginBottom: '2px' }}>DIVISION</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534' }}>
                                        {division}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '6px',
                                    background: '#e0e7ff',
                                    borderRadius: '4px',
                                    textAlign: 'center',
                                    border: '2px solid #6366f1',
                                }}>
                                    <div style={{ fontSize: '9px', color: '#312e81', marginBottom: '2px' }}>GRADE</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4338ca' }}>
                                        {grade}
                                    </div>
                                </div>
                            </div>

                            {/* Grade Table */}
                            <div style={{ marginTop: '8px' }}>
                                <table style={{ width: '100%', fontSize: '8.5px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(to right, #f1f5f9, #e2e8f0)' }}>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                                CLASSIFICATION OF GRADES
                                            </th>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#334155' }}>90% ABOVE</th>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#334155' }}>80% ABOVE</th>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#334155' }}>70% ABOVE</th>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#334155' }}>60% ABOVE</th>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#334155' }}>50% ABOVE</th>
                                            <th style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#334155' }}>40% ABOVE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ background: '#ffffff' }}>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 'bold', color: '#334155' }}>
                                                GRADE OBTAIN
                                            </td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>A+</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>A</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#0891b2' }}>B+</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#0891b2' }}>B</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#d97706' }}>C</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>D</td>
                                        </tr>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 'bold', color: '#334155' }}>
                                                DISTINCTION
                                            </td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '8px' }}>A+</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '8px' }}>A+</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '7.5px' }}>1ST DIV.</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '7.5px' }}>1ST DIV.</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '7.5px' }}>2ND DIV.</td>
                                            <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontSize: '7.5px' }}>3RD DIV.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div style={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                padding: '8px',
                                background: 'white',
                                borderRadius: '8px',
                                border: '3px solid #3b82f6',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            }}>
                                <QRCodeCanvas
                                    value={`CERTIFICATE: ${certificateNumber}\nSTUDENT: ${studentName}\nCOURSE: ${courseName}`}
                                    size={90}
                                    level="H"
                                />
                            </div>
                            <div style={{
                                fontSize: '9px',
                                marginTop: '6px',
                                color: '#64748b',
                                fontWeight: 'bold',
                            }}>
                                Scan to Verify
                            </div>
                        </div>
                    </div>

                    {/* Footer - Signatures */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: '18px',
                        paddingTop: '10px',
                        borderTop: '2px solid #e2e8f0',
                    }}>
                        <div style={{ textAlign: 'center', fontSize: '10px' }}>
                            <div style={{
                                width: '120px',
                                borderTop: '2px solid #1e3a8a',
                                paddingTop: '6px',
                                marginTop: '35px',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>Director's Signature</strong>
                            </div>
                        </div>

                        <div style={{
                            width: '90px',
                            height: '90px',
                            border: '3px solid #1e40af',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                            color: 'white',
                            fontSize: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            position: 'relative',
                            boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4)',
                        }}>
                            <div>
                                OFFICIAL<br />SEAL<br />
                                <span style={{ fontSize: '8px' }}>BYTECORE</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '10px' }}>
                            <div style={{
                                width: '120px',
                                borderTop: '2px solid #1e3a8a',
                                paddingTop: '6px',
                                marginTop: '35px',
                            }}>
                                <strong style={{ color: '#1e3a8a' }}>Principal's Signature</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
