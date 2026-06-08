import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Table } from '../components/ui/Table';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'floors' | 'rooms' | 'services' | 'normatives'>('rules');
  
  const [rules, setRules] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [normatives, setNormatives] = useState<any[]>([]);
  
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isNormativeModalOpen, setIsNormativeModalOpen] = useState(false);
  
  const [deleteFloorId, setDeleteFloorId] = useState<number | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const [deleteNormativeId, setDeleteNormativeId] = useState<number | null>(null);

  const [newFloor, setNewFloor] = useState({ name: '' });
  const [newRoom, setNewRoom] = useState({ name_or_number: '', floor: '', service: '' });
  const [newService, setNewService] = useState({ name: '', description: '', concurrent_capacity: 1 });
  const [newNormative, setNewNormative] = useState({ name: '', hora_inicio: '', hora_fin: '', hourly_rate: '', legal_justification: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resFloors, resRooms, resServices, resNormatives, resRules] = await Promise.all([
        api.get('config/floors/'),
        api.get('config/rooms/'),
        api.get('config/services/'),
        api.get('config/normatives/'),
        api.get('config/rules/')
      ]);
      setFloors(resFloors.data);
      setRooms(resRooms.data);
      setServices(resServices.data);
      setNormatives(resNormatives.data);
      setRules(resRules.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('config/floors/', newFloor);
      setNewFloor({ name: '' });
      setIsFloorModalOpen(false);
      fetchData();
    } catch (err) { alert('Error al crear piso'); }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('config/rooms/', newRoom);
      setNewRoom({ name_or_number: '', floor: '', service: '' });
      setIsRoomModalOpen(false);
      fetchData();
    } catch (err) { alert('Error al crear consultorio'); }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('config/services/', newService);
      setNewService({ name: '', description: '', concurrent_capacity: 1 });
      setIsServiceModalOpen(false);
      fetchData();
    } catch (err) { alert('Error al crear servicio'); }
  };

  const handleCreateNormative = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: newNormative.name,
        hourly_rate: newNormative.hourly_rate,
        legal_justification: newNormative.legal_justification
      };
      if (newNormative.hora_inicio) payload.hora_inicio = newNormative.hora_inicio;
      if (newNormative.hora_fin) payload.hora_fin = newNormative.hora_fin;
      
      await api.post('config/normatives/', payload);
      setNewNormative({ name: '', hora_inicio: '', hora_fin: '', hourly_rate: '', legal_justification: '' });
      setIsNormativeModalOpen(false);
      fetchData();
    } catch (err) { alert('Error al crear normativa'); }
  };

  const confirmDelete = async (type: string, id: number) => {
    try {
      await api.delete(`config/${type}/${id}/`);
      fetchData();
    } catch (err) {
      alert('Error al eliminar. Verifique que no haya registros dependientes.');
    }
  };

  const handleToggleRule = async (rule: any) => {
    try {
      await api.patch(`config/rules/${rule.id}/`, { activo: !rule.activo });
      fetchData();
    } catch (err) {
      alert('Error al actualizar la regla');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)', marginBottom: '8px' }}>Infraestructura y Configuración</h1>
        <p style={{ color: '#64748b' }}>Define los bienes raíces del hospital, áreas médicas y reglas financieras.</p>
      </header>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px', overflowX: 'auto' }}>
        {[{ id: 'rules', label: '⚙️ Reglas del Motor' }, { id: 'floors', label: '🏢 Pisos' }, { id: 'rooms', label: '🚪 Consultorios' }, { id: 'services', label: '⚕️ Especialidades' }, { id: 'normatives', label: '💰 Finanzas' }].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 24px', background: 'transparent', border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #4f46e5' : '3px solid transparent',
              color: activeTab === tab.id ? '#4f46e5' : '#64748b',
              fontWeight: activeTab === tab.id ? 'bold' : '500',
              fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* CONTENT */}
      <section style={{ animation: 'fadeIn 0.3s' }}>
        {activeTab === 'rules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Motor Experto de Asignación</h2>
              <span style={{ fontSize: '0.9rem', color: '#64748b', background: '#f8fafc', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                {rules.filter(r => r.activo).length} Reglas Activas
              </span>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {rules.map(rule => (
                <div key={rule.id} style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: rule.activo ? '0 4px 6px rgba(0,0,0,0.02)' : 'none',
                  opacity: rule.activo ? 1 : 0.6, transition: 'all 0.2s'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: rule.activo ? '#0f172a' : '#64748b', marginBottom: '4px' }}>
                      {rule.nombre}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '600px' }}>
                      {rule.descripcion}
                    </p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <div 
                    onClick={() => handleToggleRule(rule)}
                    style={{
                      width: '50px', height: '26px', borderRadius: '13px',
                      background: rule.activo ? '#10b981' : '#cbd5e1',
                      position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                    }}
                  >
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                      position: 'absolute', top: '2px', left: rule.activo ? '26px' : '2px',
                      transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'floors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Niveles del Edificio</h2>
              <button onClick={() => setIsFloorModalOpen(true)} className="btn btn-primary btn-sm">+ Añadir Piso</button>
            </div>
            <Table 
              columns={[
                { header: 'Piso', accessor: 'nombre' },
                { header: 'Acciones', render: (item) => <button className="btn btn-danger btn-sm" onClick={() => setDeleteFloorId(item.id)}>Eliminar</button> }
              ]} 
              data={floors} emptyMessage="No hay pisos registrados." 
            />
          </div>
        )}

        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Consultorios y Habitaciones</h2>
              <button onClick={() => setIsRoomModalOpen(true)} className="btn btn-primary btn-sm">+ Nuevo Consultorio</button>
            </div>
            <Table 
              columns={[
                { header: 'Identificador', render: (item) => <b>{item.nombre_o_numero}</b> },
                { header: 'Piso', render: (item) => item.detalles_piso?.nombre },
                { header: 'Servicio', render: (item) => item.detalles_servicio?.nombre },
                { header: 'Acciones', render: (item) => <button className="btn btn-danger btn-sm" onClick={() => setDeleteRoomId(item.id)}>Eliminar</button> }
              ]} 
              data={rooms} emptyMessage="No hay consultorios registrados." 
            />
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Áreas Médicas (Especialidades)</h2>
              <button onClick={() => setIsServiceModalOpen(true)} className="btn btn-primary btn-sm">+ Nueva Especialidad</button>
            </div>
            <Table 
              columns={[
                { header: 'Nombre', accessor: 'nombre' },
                { header: 'Descripción', accessor: 'descripcion' },
                { header: 'Acciones', render: (item) => <button className="btn btn-danger btn-sm" onClick={() => setDeleteServiceId(item.id)}>Eliminar</button> }
              ]} 
              data={services} emptyMessage="No hay especialidades registradas." 
            />
          </div>
        )}

        {activeTab === 'normatives' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tarifas de Honorarios</h2>
              <button onClick={() => setIsNormativeModalOpen(true)} className="btn btn-success btn-sm">+ Nueva Tarifa</button>
            </div>
            <Table 
              columns={[
                { header: 'Nombre', render: (item) => <b>{item.nombre}</b> },
                { header: 'Horario', render: (item) => item.hora_inicio ? `${item.hora_inicio} - ${item.hora_fin}` : 'Todo el día' },
                { header: 'Tarifa', render: (item) => <span style={{color: '#10b981', fontWeight: 'bold'}}>${item.tarifa_por_hora}</span> },
                { header: 'Acciones', render: (item) => <button className="btn btn-danger btn-sm" onClick={() => setDeleteNormativeId(item.id)}>Revocar</button> }
              ]} 
              data={normatives} emptyMessage="No hay tarifas." 
            />
          </div>
        )}
      </section>

      {/* MODALS */}
      <Modal isOpen={isFloorModalOpen} onClose={() => setIsFloorModalOpen(false)} title="🏢 Añadir Piso">
        <form onSubmit={handleCreateFloor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" required placeholder="Ej. Planta Baja, Piso 1" value={newFloor.name} onChange={e => setNewFloor({...newFloor, name: e.target.value})} className="form-input" />
          <button type="submit" className="btn btn-primary btn-block">Guardar Piso</button>
        </form>
      </Modal>

      <Modal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} title="🚪 Crear Consultorio Físico">
        <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" required placeholder="Ej. Consultorio 104" value={newRoom.name_or_number} onChange={e => setNewRoom({...newRoom, name_or_number: e.target.value})} className="form-input" />
          <select required value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="form-input">
            <option value="">Seleccione un Piso</option>
            {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select required value={newRoom.service} onChange={e => setNewRoom({...newRoom, service: e.target.value})} className="form-input">
            <option value="">Seleccione la Especialidad</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-block">Guardar Consultorio</button>
        </form>
      </Modal>

      <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="⚕️ Crear Especialidad">
        <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" required placeholder="Ej. Pediatría" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="form-input" />
          <input type="text" placeholder="Descripción" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="form-input" />
          <button type="submit" className="btn btn-primary btn-block">Guardar Especialidad</button>
        </form>
      </Modal>

      <Modal isOpen={isNormativeModalOpen} onClose={() => setIsNormativeModalOpen(false)} title="💰 Crear Tarifa">
        <form onSubmit={handleCreateNormative} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" required placeholder="Ej. Tarifa Nocturna" value={newNormative.name} onChange={e => setNewNormative({...newNormative, name: e.target.value})} className="form-input" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Hora inicio</label><input type="time" value={newNormative.hora_inicio} onChange={e => setNewNormative({...newNormative, hora_inicio: e.target.value})} className="form-input" /></div>
            <div><label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Hora fin</label><input type="time" value={newNormative.hora_fin} onChange={e => setNewNormative({...newNormative, hora_fin: e.target.value})} className="form-input" /></div>
          </div>
          <input type="number" step="0.01" required placeholder="Valor por hora $ (Ej: 45.00)" value={newNormative.hourly_rate} onChange={e => setNewNormative({...newNormative, hourly_rate: e.target.value})} className="form-input" />
          <input type="text" required placeholder="Justificación (Ej. Ley #123)" value={newNormative.legal_justification} onChange={e => setNewNormative({...newNormative, legal_justification: e.target.value})} className="form-input" />
          <button type="submit" className="btn btn-success btn-block">Activar Tarifa</button>
        </form>
      </Modal>

      {/* CONFIRM DELETES */}
      <ConfirmModal isOpen={deleteFloorId !== null} title="Eliminar Piso" confirmLabel="Sí, eliminar" message="¿Estás seguro de que deseas eliminar este piso? Los consultorios dependientes también se eliminarán." onConfirm={() => { confirmDelete('floors', deleteFloorId!); setDeleteFloorId(null); }} onCancel={() => setDeleteFloorId(null)} />
      <ConfirmModal isOpen={deleteRoomId !== null} title="Eliminar Consultorio" confirmLabel="Sí, eliminar" message="¿Estás seguro de que deseas eliminar este consultorio? Los turnos asignados a él se verán afectados." onConfirm={() => { confirmDelete('rooms', deleteRoomId!); setDeleteRoomId(null); }} onCancel={() => setDeleteRoomId(null)} />
      <ConfirmModal isOpen={deleteServiceId !== null} title="Eliminar Especialidad" confirmLabel="Sí, eliminar" message="¿Estás seguro de que deseas eliminar esta especialidad? Verifica que no haya consultorios asignados a ella." onConfirm={() => { confirmDelete('services', deleteServiceId!); setDeleteServiceId(null); }} onCancel={() => setDeleteServiceId(null)} />
      <ConfirmModal isOpen={deleteNormativeId !== null} title="Revocar Tarifa" confirmLabel="Revocar" message="¿Estás seguro de que deseas revocar esta tarifa? Las liquidaciones futuras podrían no calcularse correctamente." onConfirm={() => { confirmDelete('normatives', deleteNormativeId!); setDeleteNormativeId(null); }} onCancel={() => setDeleteNormativeId(null)} />

    </div>
  );
};
