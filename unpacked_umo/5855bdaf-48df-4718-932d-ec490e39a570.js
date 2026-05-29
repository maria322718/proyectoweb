// UMO — Plataforma de Consultorios Médicos Universitarios — Mock Data
(function () {
  const d   = new Date();
  const fmt = (dt) => dt.toISOString().split('T')[0];
  const yd  = new Date(d); yd.setDate(d.getDate() - 1);
  const tda = new Date(d); tda.setDate(d.getDate() - 2);

  window.umoData = {
    today: fmt(d),
    yesterday: fmt(yd),
    twoDaysAgo: fmt(tda),

    patients: [
      { id:1, name:'Ana Torres',  identification:'1001234567', email:'ana.torres@uni.edu.co',  phone:'312 456 7890', status:'ACTIVE'   },
      { id:2, name:'Carlos Ruiz', identification:'1009876543', email:'carlos.ruiz@uni.edu.co', phone:'313 987 6543', status:'ACTIVE'   },
      { id:3, name:'María López', identification:'1005555555', email:'maria.lopez@uni.edu.co', phone:'314 555 5555', status:'INACTIVE' },
      { id:4, name:'Juan Pérez',  identification:'1002222222', email:'juan.perez@uni.edu.co',  phone:'315 222 2222', status:'ACTIVE'   },
      { id:5, name:'Sofía Díaz',  identification:'1003333333', email:'sofia.diaz@uni.edu.co',  phone:'316 333 3333', status:'ACTIVE'   },
    ],

    specialties: [
      { id:1, name:'Medicina General', code:'MG'  },
      { id:2, name:'Psicología',       code:'PSI' },
      { id:3, name:'Fisioterapia',     code:'FIS' },
      { id:4, name:'Nutrición',        code:'NUT' },
    ],

    doctors: [
      { id:1, name:'Dr. Andrés Mora', specialtyId:1, status:'ACTIVE', email:'a.mora@uni.edu.co'   },
      { id:2, name:'Dra. Paula Vega', specialtyId:2, status:'ACTIVE', email:'p.vega@uni.edu.co'   },
      { id:3, name:'Dr. Luis Castro', specialtyId:3, status:'ACTIVE', email:'l.castro@uni.edu.co' },
      { id:4, name:'Dra. Clara Ríos', specialtyId:1, status:'ACTIVE', email:'c.rios@uni.edu.co'   },
    ],

    rooms: [
      { id:1, name:'Consultorio 101', location:'Edificio A, Piso 1', status:'AVAILABLE'   },
      { id:2, name:'Consultorio 202', location:'Edificio A, Piso 2', status:'MAINTENANCE' },
      { id:3, name:'Consultorio 303', location:'Edificio B, Piso 3', status:'AVAILABLE'   },
    ],

    appointmentTypes: [
      { id:1, name:'Consulta General',       duration:30 },
      { id:2, name:'Consulta Especializada', duration:45 },
    ],

    appointments: [
      { id:1, patientId:1, doctorId:1, roomId:1, typeId:1, date:fmt(d),   time:'09:00', endTime:'09:30', status:'CONFIRMED', cancellationReason:null, notes:'' },
      { id:2, patientId:2, doctorId:2, roomId:3, typeId:2, date:fmt(d),   time:'10:30', endTime:'11:15', status:'SCHEDULED', cancellationReason:null, notes:'Primera consulta' },
      { id:3, patientId:3, doctorId:3, roomId:1, typeId:1, date:fmt(yd),  time:'14:00', endTime:'14:30', status:'COMPLETED', cancellationReason:null, notes:'' },
      { id:4, patientId:4, doctorId:4, roomId:3, typeId:2, date:fmt(yd),  time:'11:00', endTime:'11:45', status:'NO_SHOW',   cancellationReason:null, notes:'' },
      { id:5, patientId:5, doctorId:1, roomId:1, typeId:1, date:fmt(tda), time:'15:30', endTime:'16:00', status:'CANCELLED', cancellationReason:'Paciente solicitó reprogramación por motivos personales', notes:'' },
    ],

    weeklyOccupancy: [
      { day:'Lun', total:12, occupied:9  },
      { day:'Mar', total:12, occupied:7  },
      { day:'Mié', total:10, occupied:10 },
      { day:'Jue', total:14, occupied:11 },
      { day:'Vie', total:8,  occupied:5  },
      { day:'Sáb', total:4,  occupied:2  },
    ],

    schedules: {
      1: {
        'Lunes':     ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30'],
        'Martes':    ['08:00','09:00','10:00','11:00','14:00','15:00'],
        'Miércoles': ['08:00','08:30','09:00','09:30','10:00','10:30'],
        'Jueves':    ['08:00','09:00','10:00','11:00','14:00','15:00','16:00'],
        'Viernes':   ['08:00','09:00','10:00','11:00'],
      },
      2: {
        'Lunes':     ['09:00','09:45','10:30','11:15','14:00','14:45','15:30'],
        'Miércoles': ['09:00','09:45','10:30','11:15','14:00','14:45'],
        'Viernes':   ['09:00','09:45','10:30','11:15'],
      },
      3: {
        'Martes':    ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
        'Jueves':    ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
        'Viernes':   ['07:00','07:30','08:00','08:30','09:00'],
      },
      4: {
        'Lunes':     ['10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30'],
        'Martes':    ['10:00','10:30','11:00','11:30','14:00','14:30'],
        'Jueves':    ['10:00','10:30','11:00','11:30'],
      },
    },

    reportData: {
      roomOccupancy: [
        { roomId:1, totalSlots:48, occupied:32 },
        { roomId:2, totalSlots:0,  occupied:0  },
        { roomId:3, totalSlots:44, occupied:28 },
      ],
      doctorProductivity: [
        { doctorId:1, completed:15, scheduled:3, cancelled:2, noShow:1 },
        { doctorId:2, completed:12, scheduled:2, cancelled:1, noShow:0 },
        { doctorId:3, completed:18, scheduled:1, cancelled:0, noShow:2 },
        { doctorId:4, completed:14, scheduled:4, cancelled:3, noShow:1 },
      ],
      noShows: [
        { patientId:4, count:3, lastDate:'2026-04-10' },
        { patientId:2, count:2, lastDate:'2026-04-15' },
        { patientId:1, count:1, lastDate:'2026-03-05' },
        { patientId:3, count:1, lastDate:'2026-02-28' },
      ],
    },
  };
})();
