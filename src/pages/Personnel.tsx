import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../api/axios';

export const Personnel = () => {
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const [docToDelete, setDocToDelete] = useState<any>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Form state
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    especialidad: '',
    horas_max_semanales: 48,
    apto_nocturno: true,
    foto: null as File | null,
    password: '',
    correo: '',
    categoria: 'Especialista',
    haber_basico: 0,
    servicio_asignado: 'Consulta',
    sala_habitual: '',
    antiguedad_meses: 0,
    voluntario_feriados: false,
    en_vacaciones: false,
    fecha_fin_vacaciones: '',
    permiso_activo: false,
    fecha_fin_permiso: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
    fetchRooms();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('config/services/');
      setSpecialties(response.data);
    } catch (err) {
      console.error('Error al cargar especialidades', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('config/rooms/');
      setRooms(response.data);
    } catch (err) {
      console.error('Error al cargar consultorios', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('personnel/');
      setDoctors(response.data);
    } catch (err) {
      console.error('Error al cargar personal médico. Sin conexión con el servidor.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files ? files[0] : null;
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Crear vista previa local si se seleccionó un archivo
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('nombres', formData.nombres);
      data.append('apellidos', formData.apellidos);
      data.append('cedula', formData.cedula);
      data.append('especialidad', formData.especialidad);
      data.append('horas_max_semanales', formData.horas_max_semanales.toString());
      data.append('apto_nocturno', formData.apto_nocturno.toString());
      data.append('correo', formData.correo);
      if (formData.password) {
        data.append('password', formData.password);
      }
      if (formData.foto) {
        data.append('foto', formData.foto);
      }
      data.append('categoria', formData.categoria);
      data.append('haber_basico', formData.haber_basico.toString());
      data.append('servicio_asignado', formData.servicio_asignado);
      data.append('sala_habitual', formData.sala_habitual);
      data.append('antiguedad_meses', formData.antiguedad_meses.toString());
      data.append('voluntario_feriados', formData.voluntario_feriados.toString());
      data.append('en_vacaciones', formData.en_vacaciones.toString());
      if (formData.fecha_fin_vacaciones) data.append('fecha_fin_vacaciones', formData.fecha_fin_vacaciones);
      data.append('permiso_activo', formData.permiso_activo.toString());
      if (formData.fecha_fin_permiso) data.append('fecha_fin_permiso', formData.fecha_fin_permiso);

      if (editingId) {
        const response = await api.put(`personnel/${editingId}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setDoctors(doctors.map(doc => doc.id === editingId ? response.data : doc));
        showToast('Médico actualizado correctamente.', 'success');
      } else {
        const response = await api.post('personnel/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setDoctors([response.data, ...doctors]);
        showToast('Médico registrado correctamente en PostgreSQL.', 'success');
      }
      closeModal();
    } catch (err: any) {
      const errorMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : 'Error de conexión con el servidor.';
      console.error('Error al guardar registro:', err.response?.data || err);
      showToast(`Error al guardar: ${errorMsg}`, 'error');
    }
  };

  const handleEdit = (doc: any) => {
    setEditingId(doc.id);
    setCurrentPhotoUrl(doc.foto || null);
    setFormData({
      nombres: doc.nombres,
      apellidos: doc.apellidos,
      cedula: doc.cedula,
      correo: doc.correo || '',
      especialidad: doc.especialidad,
      horas_max_semanales: doc.horas_max_semanales,
      apto_nocturno: doc.apto_nocturno,
      foto: null,
      password: '',
      categoria: doc.categoria || 'Especialista',
      haber_basico: doc.haber_basico || 0,
      servicio_asignado: doc.servicio_asignado || 'Consulta',
      sala_habitual: doc.sala_habitual || '',
      antiguedad_meses: doc.antiguedad_meses || 0,
      voluntario_feriados: doc.voluntario_feriados || false,
      en_vacaciones: doc.en_vacaciones || false,
      fecha_fin_vacaciones: doc.fecha_fin_vacaciones || '',
      permiso_activo: doc.permiso_activo || false,
      fecha_fin_permiso: doc.fecha_fin_permiso || ''
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await api.delete(`personnel/${docToDelete.id}/`);
      setDoctors(doctors.filter(doc => doc.id !== docToDelete.id));
      showToast('Médico eliminado correctamente.', 'success');
    } catch (err: any) {
      showToast('Error al eliminar el registro.', 'error');
    } finally {
      setDocToDelete(null);
    }
  };

  const handleDeleteClick = (doc: any) => {
    setDocToDelete(doc);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setCurrentPhotoUrl(null);
    setPreviewUrl(null);
    setFormData({
      nombres: '',
      apellidos: '',
      cedula: '',
      correo: '',
      especialidad: '',
      horas_max_semanales: 48,
      apto_nocturno: true,
      foto: null,
      password: '',
      categoria: 'Especialista',
      haber_basico: 0,
      servicio_asignado: 'Consulta',
      sala_habitual: '',
      antiguedad_meses: 0,
      voluntario_feriados: false,
      en_vacaciones: false,
      fecha_fin_vacaciones: '',
      permiso_activo: false,
      fecha_fin_permiso: ''
    });
  };

  return (
    <div className="flex-col gap-6">
      <header className="flex flex-col-mobile justify-between items-center mb-6" style={{ gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Personal</h1>
          <p>Expediente digital y reglas laborales del equipo médico (Sincronizado con PostgreSQL).</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span className="flex-row gap-2">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Agregar Médico
          </span>
        </Button>
      </header>

      {/* Sistema de Notificaciones Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 10000,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', padding: '16px 24px', borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          {toast.type === 'error' ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          )}
          <span style={{ fontWeight: '500' }}>{toast.message}</span>
        </div>
      )}

      {/* Modal de Nuevo Médico */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '800px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center" style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <h2 className="text-2xl font-bold text-primary">{editingId ? 'Editar Médico' : 'Registrar Nuevo Médico'}</h2>
              <button onClick={closeModal} style={{ background: '#f8f9fa', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* Contenido (Formulario Scrollable) */}
            <div style={{ overflowY: 'auto', padding: '24px' }}>
              <form id="personnel-form" onSubmit={handleSubmit} className="flex-col gap-4">
                <div className="flex gap-4">
                  <div className="form-group w-full">
                    <label className="form-label">Nombre(s)</label>
                    <input type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} className="form-input" placeholder="Ej. Juan" required />
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Apellidos</label>
                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} className="form-input" placeholder="Ej. Pérez" required />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="form-group w-full">
                    <label className="form-label">DNI (Identificación)</label>
                    <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} className="form-input" placeholder="Ej. 12345678" required />
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Correo Electrónico</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="form-input" placeholder="ejemplo@hospital.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña de Acceso (App Móvil) {editingId && <span style={{fontSize: '0.8rem', color: '#888'}}>(Dejar en blanco para no cambiar)</span>}</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder={editingId ? "Ingresa una nueva contraseña" : "Crear contraseña"} required={!editingId} />
                </div>
                <div className="flex gap-4">
                  <div className="form-group w-full">
                    <label className="form-label">Especialidad Médica</label>
                    <select 
                      name="especialidad" 
                      value={formData.especialidad} 
                      onChange={handleInputChange as any} 
                      className="form-input" 
                      required
                    >
                      <option value="" disabled>Selecciona una especialidad</option>
                      {specialties.map(spec => (
                        <option key={spec.id} value={spec.nombre}>{spec.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Categoría Profesional</label>
                    <select name="categoria" value={formData.categoria} onChange={handleInputChange as any} className="form-input">
                      <option value="Especialista">Médico Especialista</option>
                      <option value="General">Médico General</option>
                      <option value="Enfermera">Enfermera Licenciada</option>
                      <option value="Tecnico">Técnico / Paramédico</option>
                      <option value="Auxiliar">Auxiliar de Enfermería</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="form-group w-full">
                    <label className="form-label">Servicio Asignado</label>
                    <select name="servicio_asignado" value={formData.servicio_asignado} onChange={handleInputChange as any} className="form-input">
                      <option value="Emergencias">Emergencias / Urgencias</option>
                      <option value="UCI">Unidad de Cuidados Intensivos (UCI)</option>
                      <option value="Hospitalizacion">Hospitalización (Planta)</option>
                      <option value="Consulta">Consulta Externa</option>
                      <option value="Quirofano">Quirófano / Cirugía</option>
                      <option value="Laboratorio">Laboratorio / Imagenología</option>
                    </select>
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Sala/Consultorio Habitual</label>
                    <select name="sala_habitual" value={formData.sala_habitual} onChange={handleInputChange as any} className="form-input">
                      <option value="">Selecciona un consultorio...</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.nombre_o_numero}>{room.nombre_o_numero}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="form-group w-full">
                    <label className="form-label">Haber Básico (Bs.)</label>
                    <input type="number" step="0.01" name="haber_basico" value={formData.haber_basico} onChange={handleInputChange} className="form-input" required />
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Antigüedad (Meses)</label>
                    <input type="number" name="antiguedad_meses" value={formData.antiguedad_meses} onChange={handleInputChange} className="form-input" required />
                  </div>
                </div>


                <div className="flex gap-4">
                  <div className="form-group w-full">
                    <label className="form-label">Límite Legal (Horas Semanales)</label>
                    <input type="number" name="horas_max_semanales" value={formData.horas_max_semanales} onChange={handleInputChange} className="form-input" required />
                  </div>
                  <div className="form-group w-full" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="checkbox" name="apto_nocturno" id="apt_night" checked={formData.apto_nocturno} onChange={handleInputChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      <label htmlFor="apt_night" style={{ marginBottom: 0, fontWeight: '500', cursor: 'pointer', color: '#333' }}>Apto Nocturno</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="checkbox" name="voluntario_feriados" id="vol_feriados" checked={formData.voluntario_feriados} onChange={handleInputChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      <label htmlFor="vol_feriados" style={{ marginBottom: 0, fontWeight: '500', cursor: 'pointer', color: '#333' }}>Voluntario Feriados</label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4" style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div className="w-full">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <input type="checkbox" name="en_vacaciones" id="en_vacaciones" checked={formData.en_vacaciones} onChange={handleInputChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      <label htmlFor="en_vacaciones" style={{ marginBottom: 0, fontWeight: 'bold', cursor: 'pointer', color: '#333' }}>En Vacaciones</label>
                    </div>
                    {formData.en_vacaciones && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Hasta el (Fecha Fin):</label>
                        <input type="date" name="fecha_fin_vacaciones" value={formData.fecha_fin_vacaciones} onChange={handleInputChange} className="form-input" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <input type="checkbox" name="permiso_activo" id="permiso_activo" checked={formData.permiso_activo} onChange={handleInputChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      <label htmlFor="permiso_activo" style={{ marginBottom: 0, fontWeight: 'bold', cursor: 'pointer', color: '#333' }}>Permiso Activo</label>
                    </div>
                    {formData.permiso_activo && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Hasta el (Fecha Fin):</label>
                        <input type="date" name="fecha_fin_permiso" value={formData.fecha_fin_permiso} onChange={handleInputChange} className="form-input" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Fotografía de Perfil 
                  </label>
                  
                  {(previewUrl || currentPhotoUrl) && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <img src={previewUrl || currentPhotoUrl || ''} alt="Previsualización" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                        {previewUrl ? 'Vista previa de la nueva foto a guardar' : 'Foto actual guardada en el sistema'}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: '12px', border: '2px dashed var(--border)', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <input type="file" name="foto" onChange={handleInputChange} accept="image/*" style={{ width: '100%', cursor: 'pointer' }} />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer del Modal (Fijo) */}
            <div className="flex justify-between items-center" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8f9fa' }}>
              <Button type="button" variant="glass" onClick={closeModal} style={{ background: 'white', color: '#666', border: '1px solid #ddd' }}>Cancelar</Button>
              <Button type="submit" form="personnel-form" variant="primary">{editingId ? 'Actualizar Cambios' : 'Guardar'}</Button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {docToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <GlassCard style={{ width: '100%', maxWidth: '400px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444' }}>
                <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-primary">Confirmar Eliminación</h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>¿Estás seguro de que deseas eliminar a <strong>{docToDelete.nombres} {docToDelete.apellidos}</strong>? Esta acción no se puede deshacer y sus turnos quedarán huérfanos.</p>
              
              <div className="flex gap-4 justify-center">
                <Button type="button" variant="glass" onClick={() => setDocToDelete(null)} style={{ background: '#f8f9fa', color: '#333' }}>Cancelar</Button>
                <Button type="button" variant="primary" onClick={confirmDelete} style={{ background: '#ef4444' }}>Sí, Eliminar</Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Modal de Ver Perfil */}
      {viewingDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <GlassCard style={{ width: '100%', maxWidth: '450px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
            <div className="flex justify-between items-center" style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'var(--bg-main)' }}>
              <h2 className="text-xl font-bold text-primary flex-row gap-2">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Expediente Médico
              </h2>
              <button onClick={() => setViewingDoc(null)} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {viewingDoc.foto ? (
                    <img src={viewingDoc.foto} alt="Perfil" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', border: '3px solid var(--border)' }}>
                      {viewingDoc.nombres[0]}{viewingDoc.apellidos[0]}
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Profesional</label>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>Dr/a. {viewingDoc.nombres} {viewingDoc.apellidos}</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Especialidad</label>
                    <p style={{ fontWeight: '500', color: 'var(--primary)' }}>{viewingDoc.especialidad}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>DNI</label>
                    <p style={{ fontWeight: '500', color: '#333' }}>{viewingDoc.cedula}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Correo Electrónico</label>
                    <p style={{ fontWeight: '500', color: '#333' }}>{viewingDoc.correo || 'No registrado'}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Categoría / Servicio</label>
                    <p style={{ fontWeight: '500', color: '#333' }}>{viewingDoc.categoria} - {viewingDoc.servicio_asignado}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Haber Básico / Antigüedad</label>
                    <p style={{ fontWeight: '500', color: '#333' }}>Bs. {viewingDoc.haber_basico} ({viewingDoc.antiguedad_meses} meses)</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Cód. Usuario</label>
                    <p style={{ fontWeight: '500', color: '#8b5cf6', fontFamily: 'monospace', letterSpacing: '1px' }}>{viewingDoc.codigo_usuario || 'Pendiente'}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8f9fa', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Disponibilidad Dinámica</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {viewingDoc.en_vacaciones ? <Badge status="red">🔴 En Vacaciones (hasta {viewingDoc.fecha_fin_vacaciones || 'indef.'})</Badge> : null}
                      {viewingDoc.permiso_activo ? <Badge status="yellow">🟡 Permiso Activo (hasta {viewingDoc.fecha_fin_permiso || 'indef.'})</Badge> : null}
                      {!viewingDoc.en_vacaciones && !viewingDoc.permiso_activo && viewingDoc.indice_fatiga < 100 ? <Badge status="green">🟢 Disponible (Apto)</Badge> : null}
                      {!viewingDoc.en_vacaciones && !viewingDoc.permiso_activo && viewingDoc.indice_fatiga >= 100 ? <Badge status="red">🔴 Fatiga Máxima</Badge> : null}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      Índice de Fatiga ({viewingDoc.indice_fatiga || 0}%)
                    </label>
                    <div style={{ marginTop: '8px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', height: '12px', width: '100%', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                       <div style={{ 
                         background: (viewingDoc.indice_fatiga || 0) >= 100 ? '#ef4444' : (viewingDoc.indice_fatiga || 0) > 70 ? '#f59e0b' : '#10b981', 
                         height: '100%', 
                         width: `${Math.min(viewingDoc.indice_fatiga || 0, 100)}%`, 
                         transition: 'width 0.5s ease-out' 
                       }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Basado en el límite legal de {viewingDoc.horas_max_semanales} hs/sem</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Turnos Nocturnos</label>
                    <div style={{ marginTop: '4px' }}>
                      {viewingDoc.apto_nocturno ? (
                        <Badge status="green">Apto para Nocturnos</Badge>
                      ) : (
                        <Badge status="yellow">Solo Diurno</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#f8f9fa', textAlign: 'right' }}>
              <Button type="button" variant="primary" onClick={() => setViewingDoc(null)}>Cerrar Expediente</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tabla Principal */}
      <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}>
          <input 
            type="text" 
            className="form-input w-full" 
            placeholder="Buscar por nombre o especialidad..." 
            style={{ maxWidth: '400px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Cargando datos encriptados desde el servidor...</div>
          ) : doctors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay personal registrado en la base de datos. Agrega uno.</div>
          ) : (
            <table className="sleek-table">
              <thead>
                <tr>
                  <th>Profesional Médico</th>
                  <th>Especialidad</th>
                  <th>Estado Actual</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {doctors.filter(doc => 
                  doc.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  doc.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doc.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(doc => (
                  <tr key={doc.id}>
                    <td className="font-bold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {doc.foto ? (
                          <img src={doc.foto} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-main)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {doc.nombres[0]}{doc.apellidos[0]}
                          </div>
                        )}
                        {doc.nombres} {doc.apellidos}
                      </div>
                    </td>
                    <td style={{ fontWeight: '500', color: '#555' }}>{doc.especialidad}</td>
                    <td>
                      {doc.apto_nocturno ? (
                        <Badge status="green">Apto para Nocturnos</Badge>
                      ) : (
                        <Badge status="yellow">Solo Diurno</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button title="Ver Expediente" onClick={() => setViewingDoc(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '6px' }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                        <button title="Editar Registro" onClick={() => handleEdit(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '6px' }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button title="Eliminar Registro" onClick={() => handleDeleteClick(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px' }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {(() => {
          const filteredDoctors = doctors.filter(doc => 
            doc.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doc.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Mostrando {filteredDoctors.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDoctors.length)} de {filteredDoctors.length} registros
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === 1 ? '#f1f5f9' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Anterior
                </button>
                <span style={{ padding: '6px 12px', fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>
                  Página {currentPage} de {Math.max(1, Math.ceil(filteredDoctors.length / itemsPerPage))}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDoctors.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.max(1, Math.ceil(filteredDoctors.length / itemsPerPage))}
                  style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: currentPage === Math.max(1, Math.ceil(filteredDoctors.length / itemsPerPage)) ? '#f1f5f9' : 'white', color: currentPage === Math.max(1, Math.ceil(filteredDoctors.length / itemsPerPage)) ? '#94a3b8' : '#334155', cursor: currentPage === Math.max(1, Math.ceil(filteredDoctors.length / itemsPerPage)) ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        })()}
      </GlassCard>
    </div>
  );
};
