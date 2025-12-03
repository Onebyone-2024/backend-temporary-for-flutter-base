# Google Drive Integration Setup

## Environment Variables Required

Add the following environment variables to your `.env` file to enable Google Drive file uploads for Reels:

```env
# Google Drive API Configuration
GOOGLE_PROJECT_ID=<your-google-project-id>
GOOGLE_CLIENT_EMAIL=<your-service-account-email>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<your-private-key>\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID_REELS=<your-folder-id>
```

## How to Get These Values

### 1. Create a Google Cloud Project

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Enable the Google Drive API for your project

### 2. Create a Service Account

- In Google Cloud Console, navigate to **Service Accounts**
- Create a new service account
- Copy the **Service Account Email** → this is your `GOOGLE_CLIENT_EMAIL`
- Copy the **Project ID** → this is your `GOOGLE_PROJECT_ID`

### 3. Generate and Download Private Key

- In Service Account details, go to **Keys** tab
- Create a new key (JSON format)
- Download the JSON file
- Extract the `private_key` field value → this is your `GOOGLE_PRIVATE_KEY`
  - The key starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----`
  - Include the newlines (`\n`) in the env var

### 4. Create Google Drive Folder and Share with Service Account

- In Google Drive, create a folder named "reels" in your "My Drive"
- Get the folder ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
- Share this folder with your service account email
- Grant the service account **Editor** permissions
- Copy the folder ID → this is your `GOOGLE_DRIVE_FOLDER_ID_REELS`

## Important Notes

- **File Format**: Only MP4 videos are accepted
- **File Size**: Maximum 5MB per video
- **Public Access**: All uploaded files are automatically made publicly readable
- **File URL Format**: `https://drive.google.com/uc?export=download&id={FILE_ID}`

## API Endpoint

### Upload Reel with Video File

**Endpoint**: `POST /reels/upload/{userId}`

**Content-Type**: `multipart/form-data`

**Parameters**:

- `userId` (path parameter): UUID of the user uploading the reel
- `file` (form field): The MP4 video file (max 5MB)
- `description` (form field, optional): Description of the reel

**Response**:

```json
{
  "uuid": "...",
  "description": "My awesome reel",
  "source": "https://drive.google.com/uc?export=download&id=...",
  "googleDriveFileId": "...",
  "fileSize": 2097152,
  "mimeType": "video/mp4",
  "fileName": "video.mp4",
  "createdAt": "2024-12-03T...",
  "createdBy": "...",
  "creator": {
    "uuid": "...",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

## Testing with Postman

1. **Set Request Type**: `POST`
2. **URL**: `http://localhost:3000/reels/upload/{{userId}}`
   - Replace `{{userId}}` with a valid user UUID
3. **Body** (form-data):
   - `file` (File type): Select your MP4 video
   - `description` (Text type): Optional reel description
4. **Send Request**

## Troubleshooting

### Error: "Missing Google Drive configuration in .env"

- Verify all four environment variables are set correctly
- Check for typos in variable names
- Restart your server after updating .env

### Error: "Only MP4 videos are allowed"

- Ensure you're uploading a valid MP4 file
- Check the file's MIME type

### Error: "File size must be less than 5MB"

- Compress your video or use a smaller file
- Maximum file size is 5MB (5,242,880 bytes)

### Error: "Permission grant failed"

- This is a warning, not an error
- The file is still uploaded successfully
- The permission might have been pre-granted

## Database Fields

The Reel model now includes these Google Drive integration fields:

- `googleDriveFileId` (String, nullable): Google Drive file ID
- `fileSize` (Integer, nullable): File size in bytes
- `mimeType` (String, nullable): MIME type (e.g., "video/mp4")
- `fileName` (String, nullable): Original file name
- `source` (String): Public URL to the file on Google Drive

When using the traditional POST /reels endpoint (without file upload), these fields can be null.
