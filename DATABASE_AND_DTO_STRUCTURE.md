# Estructura de Base de Datos y DTOs - Finlay Pharmacovigilance Platform

## Fecha de Documentación
18 de marzo de 2026

---

## Tabla de Contenidos
1. [Entidades del Dominio](#entidades-del-dominio)
2. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
3. [Relaciones entre Entidades](#relaciones-entre-entidades)

---

## Entidades del Dominio

### GenericEntity (Clase Base)
```
Propiedades:
├── Id (int) - Identificador único
├── CreatedAt (DateTime) - Fecha de creación
└── UpdatedAt (DateTime) - Fecha de última actualización
```

### User (Heredera de IdentityUser<int>)
```
Propiedades:
├── Id (int)
├── UserName (string)
├── Email (string)
├── PasswordHash (string)
├── UserRole (string) - Rol del usuario
├── CreatedAt (DateTime)
└── UpdatedAt (DateTime)

Relaciones:
├── 1:1 con Admin
├── 1:1 con MedicalReviewer
└── 1:1 con SectionResponsible
```

### Admin (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── UserId (int) - FK
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── User (User) - Navegación

Relaciones:
└── Muchos a Uno con User
```

### Reporter (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── FullName (string) - Nombre completo
├── ReporterRelationship (ReporterRelationship enum) - Tipo de relación
├── DateOfBirth (DateTime) - Fecha de nacimiento
├── Gender (Gender enum) - Género
├── ProvinceId (int) - FK
├── Province (Province) - Navegación
├── MunicipalityId (int) - FK
├── Municipality (Municipality) - Navegación
├── PhoneNumber (string) - Opcional
├── Email (string) - Opcional
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── AefiReports (ICollection<AefiReport>) - Navegación

Relaciones:
├── Muchos a Uno con Province
├── Muchos a Uno con Municipality
└── Uno a Muchos con AefiReport
```

### VaccinatedSubject (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── FullName (string) - Nombre completo
├── IdentityNumber (string) - Número de identidad
├── DateOfBirth (DateTime) - Fecha de nacimiento
├── Gender (Gender enum) - Género
├── IsPregnant (bool?) - Embarazada (opcional)
├── ProvinceId (int) - FK
├── Province (Province) - Navegación
├── MunicipalityId (int) - FK
├── Municipality (Municipality) - Navegación
├── HealthArea (string) - Área de salud (opcional)
├── Address (string) - Dirección (opcional)
├── PhoneNumber (string) - Teléfono (opcional)
├── Email (string) - Email (opcional)
├── CreatedAt (DateTime)
└── UpdatedAt (DateTime)

Relaciones:
├── Muchos a Uno con Province
└── Muchos a Uno con Municipality
```


### Vaccine (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── Name (string) - Nombre de la vacuna
├── Manufacturer (string) - Fabricante
├── VaccineType (string) - Tipo de vacuna
├── Description (string) - Descripción
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── Vaccinations (ICollection<Vaccination>) - Navegación

Relaciones:
└── Uno a Muchos con Vaccination
```

### Vaccination (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── BatchNumber (string) - Número de lote
├── AdministrationSite (string) - Sitio de administración
├── DoseNumber (int) - Número de dosis
├── AdministrationDate (DateTime) - Fecha de administración
├── VaccineId (int) - FK
├── Vaccine (Vaccine) - Navegación
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── AefiReports (ICollection<AefiReport>) - Navegación

Relaciones:
├── Muchos a Uno con Vaccine
└── Uno a Muchos con AefiReport
```

### AefiReport (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── ReportDate (DateTime) - Fecha del reporte
├── GeneralNotes (string) - Notas generales
├── PhysicianId (int) - FK
├── Physician (Physician) - Navegación
├── PatientId (int) - FK
├── Patient (Patient) - Navegación
├── VaccinationId (int) - FK
├── Vaccination (Vaccination) - Navegación
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── AdverseEvents (ICollection<AdverseEvent>) - Navegación

Relaciones:
├── Muchos a Uno con Physician
├── Muchos a Uno con Patient
├── Muchos a Uno con Vaccination
└── Uno a Muchos con AdverseEvent
```

### AdverseEvent (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── StartDate (DateTime) - Fecha de inicio del evento
├── Description (string) - Descripción
├── Severity (SeverityLevel enum) - Severidad
├── RequiredHospitalization (bool) - Requirió hospitalización
├── Treatment (string) - Tratamiento
├── Notes (string) - Notas
├── CurrentStatus (string) - Estado actual
├── AefiReportId (int) - FK
├── AefiReport (AefiReport) - Navegación
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── AdverseEventSymptoms (ICollection<AdverseEventSymptom>) - Navegación

Relaciones:
├── Muchos a Uno con AefiReport
└── Uno a Muchos con AdverseEventSymptom
```

### Symptom (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── Name (string) - Nombre del síntoma
├── Description (string) - Descripción
├── StandardCode (string) - Código estándar
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── AdverseEventSymptoms (ICollection<AdverseEventSymptom>) - Navegación

Relaciones:
└── Uno a Muchos con AdverseEventSymptom
```

### AdverseEventSymptom (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── AdverseEventId (int) - FK
├── AdverseEvent (AdverseEvent) - Navegación
├── SymptomId (int) - FK
├── Symptom (Symptom) - Navegación
├── CreatedAt (DateTime)
└── UpdatedAt (DateTime)

Relaciones:
├── Muchos a Uno con AdverseEvent
└── Muchos a Uno con Symptom
```

### Province
```
Propiedades:
├── Id (int)
├── Name (string) - Nombre de la provincia
└── Municipalities (ICollection<Municipality>) - Navegación

Relaciones:
└── Uno a Muchos con Municipality
```

### Municipality
```
Propiedades:
├── Id (int)
├── Name (string) - Nombre del municipio
├── ProvinceId (int) - FK
└── Province (Province) - Navegación

Relaciones:
└── Muchos a Uno con Province
```

### MedicalReviewer (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── DateOfBirth (DateTime) - Fecha de nacimiento
├── Gender (Gender enum) - Género
├── ProvinceId (int) - FK
├── Province (Province) - Navegación
├── MunicipalityId (int) - FK
├── Municipality (Municipality) - Navegación
├── HealthArea (string) - Área de salud
├── PhoneNumber (string) - Teléfono
├── Email (string) - Email
├── UserId (int) - FK
├── User (User) - Navegación
├── CreatedAt (DateTime)
├── UpdatedAt (DateTime)
└── AefiReports (ICollection<AefiReport>) - Navegación

Relaciones:
├── Muchos a Uno con User
├── Muchos a Uno con Province
├── Muchos a Uno con Municipality
└── Uno a Muchos con AefiReport
```

### SectionResponsible (Heredera de GenericEntity)
```
Propiedades:
├── Id (int)
├── ProvinceId (int) - FK
├── Province (Province) - Navegación
├── UserId (int) - FK
├── User (User) - Navegación
├── CreatedAt (DateTime)
└── UpdatedAt (DateTime)

Relaciones:
├── Muchos a Uno con Province
└── Muchos a Uno con User
```

---

## DTOs (Data Transfer Objects)

### Autenticación

#### RegisterUserDto
```
Propiedades:
├── Name (string) - Nombre (requerido)
├── UserName (string) - Nombre de usuario (requerido)
├── Email (string) - Email (requerido, validado)
├── Password (string) - Contraseña (requerida, mín. 6 caracteres)
└── UserRole (string) - Rol de usuario (requerido)

Validaciones:
├── Email: Formato válido de email
└── Password: Mínimo 6 caracteres
```

#### LoginUserDto
```
Propiedades:
├── Email (string) - Email (requerido, validado)
└── Password (string) - Contraseña (requerida, mín. 6 caracteres)

Validaciones:
├── Email: Formato válido de email
└── Password: Mínimo 6 caracteres
```

#### UserResponseDTO
```
Propiedades:
├── Id (int) - ID del usuario
├── UserName (string) - Nombre de usuario (requerido)
├── Email (string) - Email (requerido)
├── UserRole (string) - Rol de usuario (requerido)
└── Token (string) - Token JWT (requerido)
```

### Usuarios

#### GetUserDto
```
Propiedades:
├── UserName (string) - Nombre de usuario (requerido)
├── UserRole (string) - Rol de usuario (requerido)
└── Email (string) - Email (requerido)
```

### Reportes

#### ReportDto
```
Propiedades:
├── ReportDate (DateTime) - Fecha del reporte (requerida)
├── GeneralNotes (string) - Notas generales (requeridas)
├── PhysicianId (int) - ID del médico (requerido)
├── Pacient (PatientDto) - Datos del paciente (requerido)
├── Vaccination (VaccinationDto) - Datos de vacunación (requerido)
└── AdverseEvents (List<AdverseEventDto>) - Lista de eventos adversos (requerida)
```

#### PatientDto
```
Propiedades:
├── FullName (string) - Nombre completo (requerido)
├── Address (string) - Dirección (requerida)
├── Age (int) - Edad (requerida)
├── DateOfBirth (DateTime) - Fecha de nacimiento (requerida)
├── Gender (Gender enum) - Género (requerido)
└── Province (Province enum) - Provincia (requerida)
```

#### VaccinationDto
```
Propiedades:
├── Vaccine (VaccineDto) - Datos de la vacuna (requerido)
├── BatchNumber (string) - Número de lote (requerido)
├── AdministrationSite (string) - Sitio de administración (requerido)
├── DoseNumber (int) - Número de dosis (requerido)
└── AdministrationDate (DateTime) - Fecha de administración (requerida)
```

#### VaccineDto
```
Propiedades:
├── Name (string) - Nombre de la vacuna (requerido)
├── VaccineType (string) - Tipo de vacuna (requerido)
├── Description (string) - Descripción (requerida)
└── Manufacturer (string) - Fabricante (requerido)
```

#### AdverseEventDto
```
Propiedades:
├── StartDate (DateTime) - Fecha de inicio (requerida)
├── Description (string) - Descripción (requerida)
├── Severity (SeverityLevel enum) - Severidad (requerida)
├── RequiredHospitalization (bool) - Requirió hospitalización (requerido)
├── Treatment (string) - Tratamiento (requerido)
├── Notes (string) - Notas (requeridas)
├── CurrentStatus (string) - Estado actual (requerido)
└── Symptoms (List<SymptomDto>) - Lista de síntomas (requerida)
```

#### SymptomDto
```
Propiedades:
├── Name (string) - Nombre del síntoma (requerido)
├── Description (string) - Descripción (requerida)
└── StandardCode (string) - Código estándar (requerido)
```

#### ReportResponseDto
```
Propiedades:
(Actualmente vacía - pendiente de implementación)
```

---

## Relaciones entre Entidades

### Diagrama de Relaciones Principales

```
User (1)
├── (1:1) Admin
├── (1:1) MedicalReviewer
└── (1:1) SectionResponsible

Province (1)
├── (1:N) Municipality
├── (1:N) Reporter
├── (1:N) VaccinatedSubject
├── (1:N) MedicalReviewer
└── (1:N) SectionResponsible

Municipality (1)
├── (1:N) Reporter
├── (1:N) VaccinatedSubject
└── (1:N) MedicalReviewer

Vaccine (1)
└── (1:N) Vaccination

Vaccination (1)
└── (1:N) AefiReport

Patient/VaccinatedSubject (1)
└── (1:N) AefiReport

Physician (1)
└── (1:N) AefiReport

AefiReport (1)
└── (1:N) AdverseEvent

AdverseEvent (1)
└── (1:N) AdverseEventSymptom

Symptom (1)
└── (1:N) AdverseEventSymptom
```

### Tabla de Relaciones

| Entidad Origen | Tipo | Entidad Destino | Descripción |
|---|---|---|---|
| User | 1:1 | Admin | Un usuario es un administrador |
| User | 1:1 | MedicalReviewer | Un usuario es un revisor médico |
| User | 1:1 | SectionResponsible | Un usuario es responsable de sección |
| Province | 1:N | Municipality | Una provincia tiene muchos municipios |
| Province | 1:N | Reporter | Una provincia tiene muchos reporteros |
| Province | 1:N | VaccinatedSubject | Una provincia tiene muchos sujetos vacunados |
| Province | 1:N | MedicalReviewer | Una provincia tiene muchos revisores médicos |
| Province | 1:N | SectionResponsible | Una provincia tiene muchos responsables de sección |
| Municipality | 1:N | Reporter | Un municipio tiene muchos reporteros |
| Municipality | 1:N | VaccinatedSubject | Un municipio tiene muchos sujetos vacunados |
| Municipality | 1:N | MedicalReviewer | Un municipio tiene muchos revisores médicos |
| Vaccine | 1:N | Vaccination | Una vacuna tiene muchas vacunaciones |
| Vaccination | 1:N | AefiReport | Una vacunación tiene muchos reportes |
| Patient | 1:N | AefiReport | Un paciente tiene muchos reportes |
| Physician | 1:N | AefiReport | Un médico tiene muchos reportes |
| AefiReport | 1:N | AdverseEvent | Un reporte tiene muchos eventos adversos |
| AdverseEvent | 1:N | AdverseEventSymptom | Un evento adverso tiene muchos síntomas |
| Symptom | 1:N | AdverseEventSymptom | Un síntoma puede aparecer en muchos eventos adversos |

---

## Notas Importantes

1. **Entidades Faltantes**: Las entidades `Patient` y `Physician` están referenciadas en `AefiReport` pero no se encuentran localizadas en el dominio actual. Revisar si existen en otro módulo o requieren ser creadas.

2. **ReportResponseDto**: Esta clase está vacía y pendiente de implementación. Se debe definir qué información se retornará en las respuestas de reportes.

3. **Mapeo Automático**: Los DTOs están mapeados automáticamente a las entidades del dominio mediante AutoMapper con configuración en `AutomapperProfile.cs`.

4. **Enumeraciones Utilizadas**:
   - `Gender`: Para género (valores no documentados)
   - `Province`: Para provinciaenumerada en PatientDto
   - `SeverityLevel`: Para severidad de eventos adversos
   - `ReporterRelationship`: Para tipo de relación del reportero

5. **Campos Opcionales**: Los campos marcados como `?` son opcionales (nullable).

6. **Campos Requeridos**: Los campos marcados como `required` son obligatorios en los DTOs.

---

*Documento generado automáticamente a partir de la estructura del proyecto Finlay Pharmacovigilance Platform*
