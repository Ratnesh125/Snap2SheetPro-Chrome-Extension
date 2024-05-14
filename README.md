# Snap2SheetPro-Chrome-Extension
Extension that capture, process ,append to sheet.
![Screenshot (388)](https://github.com/Ratnesh125/Snap2SheetPro-Chrome-Extension/assets/87529730/1fe9d758-60c3-49b5-bb00-ad716027a704)
![Screenshot (389)](https://github.com/Ratnesh125/Snap2SheetPro-Chrome-Extension/assets/87529730/f2607995-4ce1-4ab2-8558-eb7742a3344a)
<h1>Job Application Tracker Chrome Extension</h1>

<h2>Problem</h2>
<p>Tracking job applications is a significant challenge. On average, a student or working professional applies to more than 500 jobs before landing a final offer. Common issues include:</p>
    <ul>
        <li>Losing track of the applications sent to different companies.</li>
        <li>Uncertainty about which applications are shortlisted or rejected.</li>
        <li>Difficulty in tracking the current status after getting shortlisted.</li>
        <li>No centralized place to track notes for each company.</li>
    </ul>

<h2>Solution</h2>
<p>We propose a Google Chrome extension designed to help users track their job applications efficiently. This extension takes screenshots of the inputs and uses GPT-4 to extract key information such as company name, location, role, and job posting link.</p>

<h2>User Journey</h2>
    <ol>
        <li><strong>Download and Install</strong>: The user downloads and installs our Chrome extension.</li>
        <li><strong>Grant Permissions</strong>: The user provides necessary permissions.</li>
        <li><strong>Link a Document</strong>: The user links a Google Doc and gives edit permissions.</li>
        <li><strong>Start Applying</strong>: As the user applies for jobs, our Chrome extension works in the background.</li>
        <li><strong>Track Applications</strong>:
            <ul>
                <li>The user triggers the extension using a keyboard shortcut whenever they want to track a submitted job application.</li>
                <li>The extension captures a screenshot of the screen and extracts details such as company name, location, role, and job posting link.</li>
            </ul>
        </li>
        <li><strong>Record Details</strong>: The extracted details are added as a new record in the linked Google Sheet.</li>
        <li><strong>Default Status</strong>: The job application status is set to “Applied” by default.</li>
        <li><strong>Update Status</strong>: The user can update the status of the job application as needed.</li>
    </ol>
