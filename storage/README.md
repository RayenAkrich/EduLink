# Storage Directory

This directory stores uploaded files for the EduLink application.

## Schedule Files (Emploi du temps)

Schedule files for classes are stored here with the following naming convention:
- **Pattern**: `Emploi-{nomClasse}-{annéeScolaire}.{ext}`
- **Example**: `Emploi-6emeA-2024-2025.pdf`, `Emploi-TerminaleS1-2024-2025.xlsx`

Note: Special characters in class names and years are replaced with underscores for filesystem compatibility.

### Supported Formats
- PDF (`.pdf`)
- Excel (`.xlsx`, `.csv`)
- Images (`.png`, `.jpg`, `.jpeg`)

### File Size Limit
- Maximum: 10 MB per file

### Management
- Files are automatically managed through the Classes Management interface
- Only admins and teachers can upload schedules
- Only admins can delete schedules
- All authenticated users can download schedules

## Important Notes
- This directory is created automatically if it doesn't exist
- When uploading a new schedule, any existing schedule with a different extension is automatically deleted
- Files are served with appropriate content-type headers for browser compatibility
