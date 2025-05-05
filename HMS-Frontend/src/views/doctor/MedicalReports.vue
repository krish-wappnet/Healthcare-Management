<template>
  <div class="medical-reports">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>Medical Reports</h1>
        <button @click="openModal" class="add-button">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Report
        </button>
      </div>

      <!-- Error and Loading States -->
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="loading" class="loading-spinner">Loading...</div>

      <!-- Medical Reports Table -->
      <div class="table-container" v-if="!loading && medicalReports.data">
        <div class="table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Title</th>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th>Appointment Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in medicalReports.data" :key="report._id">
                <td>{{ report.patient.user?.name || 'N/A' }}</td>
                <td>{{ report.title }}</td>
                <td>{{ formatDate(report.date) }}</td>
                <td>{{ report.diagnosis }}</td>
                <td>
                  <span :class="`status-${report.appointment.status.toLowerCase()}`">
                    {{ report.appointment.status }}
                  </span>
                </td>
                <td>{{ formatDate(report.appointment.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination" v-if="medicalReports.total > medicalReports.limit">
          <span class="page-info">
            Showing {{ medicalReports.data.length }} of {{ medicalReports.total }} reports
          </span>
          <div class="page-controls">
            <button @click="loadPage(1)" :disabled="medicalReports.page === 1">First</button>
            <button @click="loadPage(medicalReports.page - 1)" :disabled="medicalReports.page === 1">Previous</button>
            <span>Page {{ medicalReports.page }} of {{ Math.ceil(medicalReports.total / medicalReports.limit) }}</span>
            <button @click="loadPage(medicalReports.page + 1)" :disabled="medicalReports.page === Math.ceil(medicalReports.total / medicalReports.limit)">Next</button>
            <button @click="loadPage(Math.ceil(medicalReports.total / medicalReports.limit))" :disabled="medicalReports.page === Math.ceil(medicalReports.total / medicalReports.limit)">Last</button>
          </div>
        </div>
      </div>

      <!-- Modal for Adding Report -->
      <transition name="modal">
        <div v-if="showModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Create Medical Report</h2>
              <button @click="closeModal" class="close-button">
                <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form @submit.prevent="submitReport" class="modal-form">
              <!-- Appointment Selection -->
              <div class="form-group">
                <label>Appointment</label>
                <div class="select-wrapper">
                  <select v-model="reportForm.appointment" @change="handleAppointmentChange" required>
                    <option value="" disabled>Select Appointment</option>
                    <option v-for="appointment in appointments" :key="appointment._id" :value="appointment._id">
                      {{ formatDate(appointment.date) }}
                    </option>
                  </select>
                  <svg class="select-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <!-- Title and Dates -->
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Title</label>
                  <input type="text" v-model="reportForm.title" placeholder="Enter report title" required />
                </div>
                <div class="form-group">
                  <label>Date</label>
                  <input type="date" v-model="reportForm.date" required />
                </div>
                <div class="form-group">
                  <label>Follow-Up Date</label>
                  <input type="date" v-model="reportForm.followUpDate" />
                </div>
              </div>

              <!-- Diagnosis and Symptoms -->
              <div class="form-section">
                <div class="form-group full-width">
                  <label>Diagnosis</label>
                  <input type="text" v-model="reportForm.diagnosis" placeholder="Enter diagnosis" required />
                </div>
                <div class="form-section">
                  <div class="section-header" @click="toggleSection('symptoms')">
                    <h3>Symptoms</h3>
                    <svg
                      :class="{ 'rotate-180': sectionsOpen.symptoms }"
                      class="toggle-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div v-show="sectionsOpen.symptoms" class="section-content">
                    <div class="symptoms-container">
                      <!-- Search and Add Section -->
                      <div class="symptoms-input-section">
                        <div class="symptoms-input">
                          <input
                            v-model="symptomInput"
                            placeholder="Search symptoms..."
                            @input="filterSymptoms"
                            class="symptom-search"
                          />
                          <button
                            @click="addSymptom"
                            :disabled="!symptomInput"
                            class="add-symptom-button"
                          >
                            Add
                          </button>
                        </div>
                        <div class="symptoms-list">
                          <div
                            v-for="(symptom, index) in filteredSymptoms"
                            :key="index"
                            class="symptom-item"
                            @click="selectSymptom(symptom)"
                            :class="{ 'selected': selectedSymptoms.includes(symptom) }"
                          >
                            {{ symptom }}
                            <button
                              v-if="selectedSymptoms.includes(symptom)"
                              @click.stop="removeSymptom(index)"
                              class="remove-symptom-button"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Selected Symptoms Section -->
                      <div v-if="reportForm.symptoms.length > 0" class="selected-symptoms-section">
                        <h4>Selected Symptoms</h4>
                        <div class="selected-symptoms-list">
                          <div
                            v-for="(symptom, index) in reportForm.symptoms"
                            :key="index"
                            class="selected-symptom-item"
                          >
                            <span class="symptom-text">{{ symptom }}</span>
                            <button
                              @click="removeSymptom(index)"
                              class="remove-symptom-button"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Treatment Plan and Notes -->
              <div class="form-section">
                <div class="form-group full-width">
                  <label>Treatment Plan</label>
                  <textarea
                    v-model="reportForm.treatmentPlan"
                    rows="3"
                    placeholder="Describe the treatment plan"
                    required
                  ></textarea>
                </div>
                <div class="form-group full-width">
                  <label>Notes</label>
                  <textarea v-model="reportForm.notes" rows="3" placeholder="Additional notes"></textarea>
                </div>
              </div>

              <!-- Medications (Collapsible) -->
              <div class="form-section">
                <div class="section-header" @click="toggleSection('medications')">
                  <h3>Medications</h3>
                  <svg
                    :class="{ 'rotate-180': sectionsOpen.medications }"
                    class="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div v-show="sectionsOpen.medications" class="section-content">
                  <!-- Existing Medications List -->
                  <div class="medications-list" v-if="reportForm.medications.length">
                    <div class="medications-header">
                      <h4>Added Medications</h4>
                    </div>
                    <div class="medications-grid">
                      <div
                        v-for="(med, index) in reportForm.medications"
                        :key="index"
                        class="medication-card"
                      >
                        <div class="medication-card-header">
                          <div class="medication-card-title">
                            <span class="medication-name">{{ med.name }}</span>
                            <span class="medication-form">({{ med.form }})</span>
                          </div>
                          <button
                            @click="removeMedication(index)"
                            class="remove-button"
                          >
                            ×
                          </button>
                        </div>
                        <div class="medication-card-content">
                          <div class="medication-details-grid">
                            <div class="detail-item">
                              <span class="detail-label">Dosage:</span>
                              <span class="detail-value">{{ med.dosage }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Breakfast:</span>
                              <span class="detail-value">{{ med.breakfast }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Lunch:</span>
                              <span class="detail-value">{{ med.lunch }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Dinner:</span>
                              <span class="detail-value">{{ med.dinner }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Meal Timing:</span>
                              <span class="detail-value">{{ med.timing.split(',').map(t => mealTimes.find(m => m.value === t)?.label).join(', ') }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Duration:</span>
                              <span class="detail-value">{{ med.startDate }} to {{ med.endDate }}</span>
                            </div>
                            <div class="detail-item" v-if="med.instructions">
                              <span class="detail-label">Instructions:</span>
                              <span class="detail-value">{{ med.instructions }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Add New Medication Form -->
                  <div class="medication-form">
                    <div class="medication-grid">
                      <div class="form-group">
                        <label>Medication Name *</label>
                        <InputText
                          v-model="medicationInput.name"
                          placeholder="Enter medication name"
                          :class="{ 'p-invalid': validationErrors.medicationName }"
                        />
                      </div>

                      <div class="form-group">
                        <label>Form *</label>
                        <Dropdown
                          v-model="medicationInput.form"
                          :options="medicationFormTypes"
                          optionLabel="label"
                          optionValue="value"
                          :class="{ 'p-invalid': validationErrors.form }"
                        />
                      </div>

                      <div class="form-group">
                        <label>Dosage *</label>
                        <div class="dosage-inputs">
                          <div class="dosage-field">
                            <InputText
                              v-model="medicationInput.dosageValue"
                              placeholder="e.g., 100"
                              :class="{ 'p-invalid': validationErrors.dosageValue }"
                              type="number"
                              min="0"
                              style="width: 100px; margin-right: 10px;"
                            />
                            <small v-if="validationErrors.dosageValue" class="p-error">{{ validationErrors.dosageValue }}</small>
                          </div>
                          <div class="dosage-field">
                            <InputText
                              v-model="medicationInput.dosageUnit"
                              placeholder="mg, g, mcg"
                              :class="{ 'p-invalid': validationErrors.dosageUnit }"
                              style="width: 100px;"
                            />
                            <small v-if="validationErrors.dosageUnit" class="p-error">{{ validationErrors.dosageUnit }}</small>
                          </div>
                        </div>
                      </div>

                      <div class="form-group">
                        <div class="frequency-grid">
                          <div class="frequency-field">
                            <label>Breakfast</label>
                            <InputText
                              v-model="medicationInput.breakfast"
                              placeholder="0 or 1"
                              :class="{ 'p-invalid': validationErrors.breakfast }"
                              @input="validateFrequency('breakfast')"
                            />
                            <small v-if="validationErrors.breakfast" class="p-error">{{ validationErrors.breakfast }}</small>
                          </div>

                          <div class="frequency-field">
                            <label>Lunch</label>
                            <InputText
                              v-model="medicationInput.lunch"
                              placeholder="0 or 1"
                              :class="{ 'p-invalid': validationErrors.lunch }"
                              @input="validateFrequency('lunch')"
                            />
                            <small v-if="validationErrors.lunch" class="p-error">{{ validationErrors.lunch }}</small>
                          </div>

                          <div class="frequency-field">
                            <label>Dinner</label>
                            <InputText
                              v-model="medicationInput.dinner"
                              placeholder="0 or 1"
                              :class="{ 'p-invalid': validationErrors.dinner }"
                              @input="validateFrequency('dinner')"
                            />
                            <small v-if="validationErrors.dinner" class="p-error">{{ validationErrors.dinner }}</small>
                          </div>
                        </div>
                      </div>

                      <div class="form-group">
                        <label>Meal Timing *</label>
                        <MultiSelect
                          v-model="medicationInput.timing"
                          :options="mealTimes"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Select meal timing"
                          :class="{ 'p-invalid': validationErrors.timing }"
                        />
                      </div>

                      <div class="form-group">
                        <label>Start Date *</label>
                        <Calendar
                          v-model="medicationInput.startDate"
                          dateFormat="yy-mm-dd"
                          :class="{ 'p-invalid': validationErrors.startDate }"
                        />
                      </div>

                      <div class="form-group">
                        <label>End Date *</label>
                        <Calendar
                          v-model="medicationInput.endDate"
                          dateFormat="yy-mm-dd"
                          :class="{ 'p-invalid': validationErrors.endDate }"
                        />
                      </div>

                      <div class="form-group">
                        <label>Instructions</label>
                        <InputText
                          v-model="medicationInput.instructions"
                          placeholder="Additional instructions"
                        />
                      </div>
                    </div>

                    <button
                      @click="addMedication"
                      class="add-medication-button"
                    >
                      Add Medication
                    </button>
                  </div>
                </div>
              </div>

              <!-- Test Results (Collapsible) -->
              <div class="form-section">
                <div class="section-header" @click="toggleSection('testResults')">
                  <h3>Test Results</h3>
                  <svg
                    :class="{ 'rotate-180': sectionsOpen.testResults }"
                    class="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div v-show="sectionsOpen.testResults" class="section-content">
                  <div class="test-results-grid">
                    <div class="form-group">
                      <label>Test Name *</label>
                      <InputText
                        v-model="testResultInput.name"
                        placeholder="e.g., Complete Blood Count"
                        :class="{ 'p-invalid': testResultErrors.name }"
                      />
                    </div>

                    <div class="form-group">
                      <label>Test Date *</label>
                      <InputText
                        v-model="testResultInput.date"
                        type="date"
                        :class="{ 'p-invalid': testResultErrors.date }"
                      />
                    </div>

                    <div class="form-group">
                      <label>Test Result *</label>
                      <InputText
                        v-model="testResultInput.result"
                        placeholder="e.g., Normal"
                        :class="{ 'p-invalid': testResultErrors.result }"
                      />
                    </div>

                    <div class="form-group">
                      <label>Blood Pressure</label>
                      <div class="blood-pressure-inputs">
                        <div class="pressure-field">
                          <InputText
                            v-model="testResultInput.bloodPressure.systolic"
                            placeholder="Systolic"
                            :class="{ 'p-invalid': testResultErrors.bloodPressure.systolic }"
                            type="number"
                            min="80"
                            max="210"
                          />
                        </div>
                        <span class="slash">/</span>
                        <div class="pressure-field">
                          <InputText
                            v-model="testResultInput.bloodPressure.diastolic"
                            placeholder="Diastolic"
                            :class="{ 'p-invalid': testResultErrors.bloodPressure.diastolic }"
                            type="number"
                            min="40"
                            max="120"
                          />
                        </div>
                        <span class="unit">mmHg</span>
                      </div>
                    </div>

                    <div class="form-group">
                      <label>Glucose (mmol/L)</label>
                      <InputText
                        v-model="testResultInput.glucose"
                        placeholder="e.g., 5.5"
                        :class="{ 'p-invalid': testResultErrors.glucose }"
                        type="number"
                        step="0.1"
                        min="3.9"
                        max="20"
                      />
                    </div>

                    <div class="form-group">
                      <label>Cholesterol (mmol/L)</label>
                      <InputText
                        v-model="testResultInput.cholesterol"
                        placeholder="e.g., 5.0"
                        :class="{ 'p-invalid': testResultErrors.cholesterol }"
                        type="number"
                        step="0.1"
                        min="3.0"
                        max="8.0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Triglycerides (mmol/L)</label>
                      <InputText
                        v-model="testResultInput.triglycerides"
                        placeholder="e.g., 1.5"
                        :class="{ 'p-invalid': testResultErrors.triglycerides }"
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="5.0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Hemoglobin (g/dL)</label>
                      <InputText
                        v-model="testResultInput.hemoglobin"
                        placeholder="e.g., 14.5"
                        :class="{ 'p-invalid': testResultErrors.hemoglobin }"
                        type="number"
                        step="0.1"
                        min="12"
                        max="18"
                      />
                    </div>

                    <div class="form-group">
                      <label>White Blood Cells (×10^9/L)</label>
                      <InputText
                        v-model="testResultInput.whiteBloodCells"
                        placeholder="e.g., 7.5"
                        :class="{ 'p-invalid': testResultErrors.whiteBloodCells }"
                        type="number"
                        step="0.1"
                        min="4.0"
                        max="11.0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Red Blood Cells (×10^12/L)</label>
                      <InputText
                        v-model="testResultInput.redBloodCells"
                        placeholder="e.g., 5.0"
                        :class="{ 'p-invalid': testResultErrors.redBloodCells }"
                        type="number"
                        step="0.1"
                        min="4.0"
                        max="6.0"
                      />
                    </div>

                    <div class="form-group">
                      <label>Platelets (×10^9/L)</label>
                      <InputText
                        v-model="testResultInput.platelets"
                        placeholder="e.g., 250"
                        :class="{ 'p-invalid': testResultErrors.platelets }"
                        type="number"
                        min="150"
                        max="450"
                      />
                    </div>
                  </div>
                  <div class="section-actions">
                    <button @click="addTestResult" class="add-button full-width">Add Test Result</button>
                  </div>
                  <div class="test-results-list" v-if="reportForm.testResults.length">
                    <div class="test-results-header">
                      <h4>Added Test Results</h4>
                    </div>
                    <div class="test-results-grid">
                      <div
                        v-for="(result, index) in reportForm.testResults"
                        :key="index"
                        class="test-result-card"
                      >
                        <div class="test-result-card-header">
                          <div class="test-result-card-title">
                            <span class="test-result-name">{{ result.name }}</span>
                            <span class="test-result-date">({{ result.date }})</span>
                          </div>
                          <button
                            @click="removeTestResult(index)"
                            class="remove-button"
                          >
                            ×
                          </button>
                        </div>
                        <div class="test-result-card-content">
                          <div class="test-result-details-grid">
                            <div class="detail-item">
                              <span class="detail-label">Result:</span>
                              <span class="detail-value">{{ result.result }}</span>
                            </div>
                            <div class="detail-item" v-if="result.bloodPressure.systolic || result.bloodPressure.diastolic">
                              <span class="detail-label">Blood Pressure:</span>
                              <span class="detail-value">{{ result.bloodPressure.systolic }}/{{ result.bloodPressure.diastolic }} mmHg</span>
                            </div>
                            <div class="detail-item" v-if="result.glucose">
                              <span class="detail-label">Glucose:</span>
                              <span class="detail-value">{{ result.glucose }} mmol/L</span>
                            </div>
                            <div class="detail-item" v-if="result.cholesterol">
                              <span class="detail-label">Cholesterol:</span>
                              <span class="detail-value">{{ result.cholesterol }} mmol/L</span>
                            </div>
                            <div class="detail-item" v-if="result.triglycerides">
                              <span class="detail-label">Triglycerides:</span>
                              <span class="detail-value">{{ result.triglycerides }} mmol/L</span>
                            </div>
                            <div class="detail-item" v-if="result.hemoglobin">
                              <span class="detail-label">Hemoglobin:</span>
                              <span class="detail-value">{{ result.hemoglobin }} g/dL</span>
                            </div>
                            <div class="detail-item" v-if="result.whiteBloodCells">
                              <span class="detail-label">WBC:</span>
                              <span class="detail-value">{{ result.whiteBloodCells }} ×10^9/L</span>
                            </div>
                            <div class="detail-item" v-if="result.redBloodCells">
                              <span class="detail-label">RBC:</span>
                              <span class="detail-value">{{ result.redBloodCells }} ×10^12/L</span>
                            </div>
                            <div class="detail-item" v-if="result.platelets">
                              <span class="detail-label">Platelets:</span>
                              <span class="detail-value">{{ result.platelets }} ×10^9/L</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vital Signs (Collapsible) -->
              <div class="form-section">
                <div class="section-header" @click="toggleSection('vitalSigns')">
                  <h3>Vital Signs</h3>
                  <svg
                    :class="{ 'rotate-180': sectionsOpen.vitalSigns }"
                    class="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div v-show="sectionsOpen.vitalSigns" class="section-content">
                  <div class="vitals-grid">
                    <div class="form-group">
                      <label>Blood Pressure *</label>
                      <div class="blood-pressure-inputs">
                        <div class="pressure-field">
                          <InputText
                            v-model="vitalSignsInput.bloodPressure.systolic"
                            placeholder="Systolic"
                            :class="{ 'p-invalid': vitalSignsErrors.bloodPressure.systolic }"
                            type="number"
                            min="80"
                            max="210"
                          />
                          <small v-if="vitalSignsErrors.bloodPressure.systolic" class="p-error">{{ vitalSignsErrors.bloodPressure.systolic }}</small>
                        </div>
                        <span class="slash">/</span>
                        <div class="pressure-field">
                          <InputText
                            v-model="vitalSignsInput.bloodPressure.diastolic"
                            placeholder="Diastolic"
                            :class="{ 'p-invalid': vitalSignsErrors.bloodPressure.diastolic }"
                            type="number"
                            min="40"
                            max="120"
                          />
                          <small v-if="vitalSignsErrors.bloodPressure.diastolic" class="p-error">{{ vitalSignsErrors.bloodPressure.diastolic }}</small>
                        </div>
                        <span class="unit">mmHg</span>
                      </div>
                    </div>

                    <div class="form-group">
                      <label>Heart Rate *</label>
                      <InputText
                        v-model="vitalSignsInput.heartRate"
                        placeholder="BPM"
                        :class="{ 'p-invalid': vitalSignsErrors.heartRate }"
                        type="number"
                        min="40"
                        max="200"
                      />
                      <small v-if="vitalSignsErrors.heartRate" class="p-error">{{ vitalSignsErrors.heartRate }}</small>
                    </div>

                    <div class="form-group">
                      <label>Respiratory Rate *</label>
                      <InputText
                        v-model="vitalSignsInput.respiratoryRate"
                        placeholder="Breaths per minute"
                        :class="{ 'p-invalid': vitalSignsErrors.respiratoryRate }"
                        type="number"
                        min="8"
                        max="40"
                      />
                      <small v-if="vitalSignsErrors.respiratoryRate" class="p-error">{{ vitalSignsErrors.respiratoryRate }}</small>
                    </div>

                    <div class="form-group">
                      <label>Temperature *</label>
                      <InputText
                        v-model="vitalSignsInput.temperature"
                        placeholder="°C"
                        :class="{ 'p-invalid': vitalSignsErrors.temperature }"
                        type="number"
                        step="0.1"
                        min="35"
                        max="42"
                      />
                      <small v-if="vitalSignsErrors.temperature" class="p-error">{{ vitalSignsErrors.temperature }}</small>
                    </div>

                    <div class="form-group">
                      <label>Oxygen Saturation *</label>
                      <InputText
                        v-model="vitalSignsInput.oxygenSaturation"
                        placeholder="%"
                        :class="{ 'p-invalid': vitalSignsErrors.oxygenSaturation }"
                        type="number"
                        min="80"
                        max="100"
                      />
                      <small v-if="vitalSignsErrors.oxygenSaturation" class="p-error">{{ vitalSignsErrors.oxygenSaturation }}</small>
                    </div>
                  </div>
                  <div class="section-actions">
                    <button @click="resetVitalSigns" class="reset-button">Reset</button>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
                <button type="submit" class="submit-button" :disabled="loading">
                  {{ loading ? 'Creating...' : 'Create Report' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import Chips from 'primevue/chips'
import MultiSelect from 'primevue/multiselect'
import InputText from 'primevue/inputtext'
import '../../styles/medicalReport.scss'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)
const doctorId = ref<string | null>(null)
const appointments = ref<any[]>([])
const medicalReports = ref({
  data: [],
  total: 0,
  limit: 10,
  page: 1
})
const reportForm = ref({
  appointment: '',
  title: '',
  date: '',
  diagnosis: '',
  symptoms: [] as string[],
  treatmentPlan: '',
  medications: [] as any[],
  testResults: [] as any[],
  vitalSigns: {
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: ''
  },
  notes: '',
  followUpDate: ''
})
const showModal = ref(false)
const currentPage = ref(1)
const rowsPerPage = ref(10)
const totalRecords = ref(0)
const sectionsOpen = ref({
  medications: false,
  testResults: false,
  vitalSigns: false,
  symptoms: false
})

const vitalSignsInput = ref({
  bloodPressure: {
    systolic: '',
    diastolic: ''
  },
  heartRate: '',
  respiratoryRate: '',
  temperature: '',
  oxygenSaturation: ''
})

const vitalSignsErrors = ref({
  bloodPressure: {
    systolic: '',
    diastolic: ''
  },
  heartRate: '',
  respiratoryRate: '',
  temperature: '',
  oxygenSaturation: ''
})

const symptomInput = ref('')
const filteredSymptoms = ref<string[]>([])
const selectedSymptoms = ref<string[]>([])

const medicationInput = ref({
  name: '',
  form: '',
  dosageValue: '',
  dosageUnit: '',
  breakfast: '',
  lunch: '',
  dinner: '',
  startDate: '',
  endDate: '',
  instructions: '',
  timing: []
})

const validationErrors = ref({
  medicationName: '',
  form: '',
  dosageValue: '',
  dosageUnit: '',
  breakfast: '',
  lunch: '',
  dinner: '',
  startDate: '',
  endDate: ''
})

const testResultInput = ref({
  name: '',
  date: '',
  result: '',
  bloodPressure: {
    systolic: '',
    diastolic: ''
  },
  glucose: '',
  cholesterol: '',
  triglycerides: '',
  hemoglobin: '',
  whiteBloodCells: '',
  redBloodCells: '',
  platelets: ''
})

const testResultErrors = ref({
  name: '',
  date: '',
  result: '',
  bloodPressure: {
    systolic: '',
    diastolic: ''
  },
  glucose: '',
  cholesterol: '',
  triglycerides: '',
  hemoglobin: '',
  whiteBloodCells: '',
  redBloodCells: '',
  platelets: ''
})

const medicationFormTypes = ref([
  { label: 'Tablet', value: 'tablet' },
  { label: 'Syrup', value: 'syrup' },
  { label: 'Capsule', value: 'capsule' },
  { label: 'Injection', value: 'injection' },
  { label: 'Cream', value: 'cream' }
])

const mealTimes = ref([
  { label: 'Before Breakfast', value: 'before_breakfast' },
  { label: 'After Breakfast', value: 'after_breakfast' },
  { label: 'Before Lunch', value: 'before_lunch' },
  { label: 'After Lunch', value: 'after_lunch' },
  { label: 'Before Dinner', value: 'before_dinner' },
  { label: 'After Dinner', value: 'after_dinner' },
  { label: 'Bedtime', value: 'bedtime' }
])

const validateVitalSigns = () => {
  const errors = {
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: ''
  }

  // Blood Pressure Validation
  if (vitalSignsInput.value.bloodPressure.systolic) {
    const systolic = parseInt(vitalSignsInput.value.bloodPressure.systolic)
    if (isNaN(systolic)) {
      errors.bloodPressure.systolic = 'Please enter a valid number'
    } else if (systolic < 80) {
      errors.bloodPressure.systolic = 'Systolic pressure should be at least 80'
    } else if (systolic > 210) {
      errors.bloodPressure.systolic = 'Systolic pressure should not exceed 210'
    } else if (vitalSignsInput.value.bloodPressure.diastolic && systolic <= parseInt(vitalSignsInput.value.bloodPressure.diastolic)) {
      errors.bloodPressure.systolic = 'Systolic pressure should be higher than diastolic pressure'
    }
  }

  if (vitalSignsInput.value.bloodPressure.diastolic) {
    const diastolic = parseInt(vitalSignsInput.value.bloodPressure.diastolic)
    if (isNaN(diastolic)) {
      errors.bloodPressure.diastolic = 'Please enter a valid number'
    } else if (diastolic < 40) {
      errors.bloodPressure.diastolic = 'Diastolic pressure should be at least 40'
    } else if (diastolic > 120) {
      errors.bloodPressure.diastolic = 'Diastolic pressure should not exceed 120'
    } else if (vitalSignsInput.value.bloodPressure.systolic && diastolic >= parseInt(vitalSignsInput.value.bloodPressure.systolic)) {
      errors.bloodPressure.diastolic = 'Diastolic pressure should be lower than systolic pressure'
    }
  }

  // Heart Rate Validation
  if (vitalSignsInput.value.heartRate) {
    const heartRate = parseInt(vitalSignsInput.value.heartRate)
    if (isNaN(heartRate)) {
      errors.heartRate = 'Please enter a valid number'
    } else if (heartRate < 40) {
      errors.heartRate = 'Heart rate should be at least 40 BPM'
    } else if (heartRate > 200) {
      errors.heartRate = 'Heart rate should not exceed 200 BPM'
    }
  }

  // Respiratory Rate Validation
  if (vitalSignsInput.value.respiratoryRate) {
    const respiratoryRate = parseInt(vitalSignsInput.value.respiratoryRate)
    if (isNaN(respiratoryRate)) {
      errors.respiratoryRate = 'Please enter a valid number'
    } else if (respiratoryRate < 8) {
      errors.respiratoryRate = 'Respiratory rate should be at least 8 breaths per minute'
    } else if (respiratoryRate > 40) {
      errors.respiratoryRate = 'Respiratory rate should not exceed 40 breaths per minute'
    }
  }

  // Temperature Validation
  if (vitalSignsInput.value.temperature) {
    const temperature = parseFloat(vitalSignsInput.value.temperature)
    if (isNaN(temperature)) {
      errors.temperature = 'Please enter a valid number'
    } else if (temperature < 35) {
      errors.temperature = 'Temperature should be at least 35°C'
    } else if (temperature > 42) {
      errors.temperature = 'Temperature should not exceed 42°C'
    }
  }

  // Oxygen Saturation Validation
  if (vitalSignsInput.value.oxygenSaturation) {
    const oxygenSaturation = parseInt(vitalSignsInput.value.oxygenSaturation)
    if (isNaN(oxygenSaturation)) {
      errors.oxygenSaturation = 'Please enter a valid number'
    } else if (oxygenSaturation < 80) {
      errors.oxygenSaturation = 'Oxygen saturation should be at least 80%'
    } else if (oxygenSaturation > 100) {
      errors.oxygenSaturation = 'Oxygen saturation should not exceed 100%'
    }
  }

  // Update the UI errors
  vitalSignsErrors.value = errors
  return errors
}

const validateMedication = () => {
  const errors = validationErrors.value
  let isValid = true

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  // Validate required fields
  if (!medicationInput.value.name) {
    errors.medicationName = 'Medication name is required'
    isValid = false
  }

  if (!medicationInput.value.form) {
    errors.form = 'Form is required'
    isValid = false
  }

  if (!medicationInput.value.dosageValue) {
    errors.dosageValue = 'Dosage value is required'
    isValid = false
  } else if (isNaN(medicationInput.value.dosageValue)) {
    errors.dosageValue = 'Please enter a valid number'
    isValid = false
  }

  if (!medicationInput.value.dosageUnit) {
    errors.dosageUnit = 'Dosage unit is required'
    isValid = false
  }

  // Validate frequency fields
  validateFrequency('breakfast')
  validateFrequency('lunch')
  validateFrequency('dinner')

  if (errors.breakfast || errors.lunch || errors.dinner) {
    isValid = false
  }

  if (!medicationInput.value.startDate) {
    errors.startDate = 'Start date is required'
    isValid = false
  }

  if (!medicationInput.value.endDate) {
    errors.endDate = 'End date is required'
    isValid = false
  }

  return isValid
}

const validateFrequency = (field: string) => {
  const value = medicationInput.value[field]
  const errors = validationErrors.value

  if (!value) {
    errors[field] = 'This field is required'
    return
  }

  if (value !== '0' && value !== '1') {
    errors[field] = 'Please enter either 0 or 1'
    return
  }

  errors[field] = ''
}

const addMedication = async () => {
  try {
    if (!validateMedication()) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please correct the errors in the medication form',
        life: 5000
      })
      return
    }

    // Combine dosage value and unit
    const dosage = `${medicationInput.value.dosageValue}${medicationInput.value.dosageUnit}`

    // Create a copy of the medication input
    const medicationToAdd = {
      ...medicationInput.value,
      dosage,
      timing: medicationInput.value.timing.join(',')
    }

    // Add to report form
    reportForm.value.medications.push(medicationToAdd)

    // Reset form
    medicationInput.value = {
      name: '',
      form: '',
      dosageValue: '',
      dosageUnit: '',
      breakfast: '',
      lunch: '',
      dinner: '',
      startDate: '',
      endDate: '',
      instructions: '',
      timing: []
    }

    // Reset validation errors
    validationErrors.value = {
      medicationName: '',
      form: '',
      dosageValue: '',
      dosageUnit: '',
      breakfast: '',
      lunch: '',
      dinner: '',
      startDate: '',
      endDate: ''
    }

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Medication added successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error adding medication:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to add medication',
      life: 3000
    })
  }
}

const filterSymptoms = () => {
  if (!symptomInput.value) {
    filteredSymptoms.value = []
    return
  }
  
  // For now, we'll just show the input as a filtered result
  // In a real application, you might want to filter from a predefined list of symptoms
  filteredSymptoms.value = [symptomInput.value]
}

const addSymptom = () => {
  if (!symptomInput.value || selectedSymptoms.value.includes(symptomInput.value)) {
    return
  }
  
  selectedSymptoms.value.push(symptomInput.value)
  reportForm.value.symptoms = [...selectedSymptoms.value]
  symptomInput.value = ''
  filteredSymptoms.value = []
}

const removeSymptom = (index: number) => {
  selectedSymptoms.value.splice(index, 1)
  reportForm.value.symptoms = [...selectedSymptoms.value]
}

const addTestResult = () => {
  try {
    // Validate required fields
    if (!testResultInput.value.name || !testResultInput.value.date || !testResultInput.value.result) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Test name, date, and result are required',
        life: 3000
      })
      return
    }

    // Create a copy of the test result input
    const testResultToAdd = {
      ...testResultInput.value
    }

    // Add to report form
    reportForm.value.testResults.push(testResultToAdd)

    // Reset form
    testResultInput.value = {
      name: '',
      date: '',
      result: '',
      bloodPressure: {
        systolic: '',
        diastolic: ''
      },
      glucose: '',
      cholesterol: '',
      triglycerides: '',
      hemoglobin: '',
      whiteBloodCells: '',
      redBloodCells: '',
      platelets: ''
    }

    // Reset validation errors
    testResultErrors.value = {
      name: '',
      date: '',
      result: '',
      bloodPressure: {
        systolic: '',
        diastolic: ''
      },
      glucose: '',
      cholesterol: '',
      triglycerides: '',
      hemoglobin: '',
      whiteBloodCells: '',
      redBloodCells: '',
      platelets: ''
    }

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Test result added successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error adding test result:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to add test result',
      life: 3000
    })
  }
}

onMounted(async () => {
  if (!(await authStore.checkAuth())) {
    router.push('/login')
    return
  }

  const token = authStore.token
  if (!token) {
    router.push('/login')
    return
  }

  try {
    const response = await axios.get('http://localhost:3000/doctors/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const doctorProfile = response.data
    if (doctorProfile && doctorProfile._id) {
      doctorId.value = doctorProfile._id
      await Promise.all([
        fetchAppointments(),
        fetchMedicalReports()
      ])
    } else {
      error.value = 'Failed to fetch doctor profile'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch doctor profile'
  }
})

async function fetchAppointments() {
  try {
    loading.value = true
    if (!doctorId.value) {
      error.value = 'Doctor ID not available'
      return
    }

    const response = await axios.get(`http://localhost:3000/appointments/doctor/${doctorId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      params: {
        page: currentPage.value,
        limit: rowsPerPage.value
      }
    })

    appointments.value = response.data.data
    totalRecords.value = response.data.total
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch appointments'
  } finally {
    loading.value = false
  }
}

async function fetchMedicalReports() {
  try {
    loading.value = true
    const response = await axios.get(`http://localhost:3000/medical-reports/doctor/${doctorId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      params: {
        page: medicalReports.value.page,
        limit: medicalReports.value.limit
      }
    })
    medicalReports.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch medical reports'
  } finally {
    loading.value = false
  }
}

async function loadPage(page: number) {
  try {
    loading.value = true
    const response = await axios.get(`http://localhost:3000/medical-reports/doctor/${doctorId.value}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      params: {
        page,
        limit: medicalReports.value.limit
      }
    })
    medicalReports.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load page'
  } finally {
    loading.value = false
  }
}

function handleAppointmentChange() {
  const selectedAppointment = appointments.value.find(app => app._id === reportForm.value.appointment)
  if (selectedAppointment) {
    reportForm.value.appointment = selectedAppointment._id
    reportForm.value.patient = selectedAppointment.patient._id
    if (!reportForm.value.date) {
      reportForm.value.date = selectedAppointment.date
    }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function resetForm() {
  reportForm.value = {
    appointment: '',
    title: '',
    date: '',
    diagnosis: '',
    symptoms: [],
    treatmentPlan: '',
    medications: [],
    testResults: [],
    vitalSigns: {
      bloodPressure: {
        systolic: '',
        diastolic: ''
      },
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      oxygenSaturation: ''
    },
    notes: '',
    followUpDate: ''
  }
  sectionsOpen.value = {
    medications: false,
    testResults: false,
    vitalSigns: false,
    symptoms: false
  }
  medicationInput.value = {
    name: '',
    form: '',
    dosageValue: '',
    dosageUnit: '',
    breakfast: '',
    lunch: '',
    dinner: '',
    startDate: '',
    endDate: '',
    instructions: '',
    timing: []
  }
  validationErrors.value = {
    medicationName: '',
    form: '',
    dosageValue: '',
    dosageUnit: '',
    breakfast: '',
    lunch: '',
    dinner: '',
    startDate: '',
    endDate: ''
  }
  vitalSignsInput.value = {
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: ''
  }
  vitalSignsErrors.value = {
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: ''
  }
  testResultInput.value = {
    name: '',
    date: '',
    result: '',
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    glucose: '',
    cholesterol: '',
    triglycerides: '',
    hemoglobin: '',
    whiteBloodCells: '',
    redBloodCells: '',
    platelets: ''
  }
  testResultErrors.value = {
    name: '',
    date: '',
    result: '',
    bloodPressure: {
      systolic: '',
      diastolic: ''
    },
    glucose: '',
    cholesterol: '',
    triglycerides: '',
    hemoglobin: '',
    whiteBloodCells: '',
    redBloodCells: '',
    platelets: ''
  }
  symptomInput.value = ''
  filteredSymptoms.value = []
  selectedSymptoms.value = []
}

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  error.value = null
  resetForm()
}

function toggleSection(section: keyof typeof sectionsOpen.value) {
  sectionsOpen.value[section] = !sectionsOpen.value[section]
}

async function submitReport() {
  try {
    loading.value = true

    // Basic form validations
    if (!reportForm.value.appointment) {
      error.value = 'Please select an appointment'
      return
    }
    if (!reportForm.value.title) {
      error.value = 'Title is required'
      return
    }
    if (!reportForm.value.date) {
      error.value = 'Date is required'
      return
    }
    if (!reportForm.value.diagnosis) {
      error.value = 'Diagnosis is required'
      return
    }
    if (!reportForm.value.symptoms.length) {
      error.value = 'At least one symptom is required'
      return
    }
    if (!reportForm.value.treatmentPlan) {
      error.value = 'Treatment plan is required'
      return
    }

    // Validate vital signs values first
    const errors = validateVitalSigns()
    
    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => {
      return Object.values(error).some(err => err)
    })

    if (hasErrors) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please correct the errors in the vital signs form',
        life: 5000
      })
      return
    }

    // Check if all required vital signs fields are filled after validation
    if (!vitalSignsInput.value.bloodPressure.systolic || !vitalSignsInput.value.bloodPressure.diastolic) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Blood pressure is required',
        life: 5000
      })
      return
    }
    if (!vitalSignsInput.value.heartRate) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Heart rate is required',
        life: 5000
      })
      return
    }
    if (!vitalSignsInput.value.respiratoryRate) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Respiratory rate is required',
        life: 5000
      })
      return
    }
    if (!vitalSignsInput.value.temperature) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Temperature is required',
        life: 5000
      })
      return
    }
    if (!vitalSignsInput.value.oxygenSaturation) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Oxygen saturation is required',
        life: 5000
      })
      return
    }

    const selectedAppointment = appointments.value.find(a => a._id === reportForm.value.appointment)
    if (!selectedAppointment) {
      error.value = 'Appointment not found'
      return
    }

    const reportData = {
      appointment: reportForm.value.appointment,
      patient: selectedAppointment.patient._id,
      title: reportForm.value.title,
      date: reportForm.value.date,
      diagnosis: reportForm.value.diagnosis,
      symptoms: reportForm.value.symptoms,
      treatmentPlan: reportForm.value.treatmentPlan,
      medications: reportForm.value.medications,
      testResults: reportForm.value.testResults,
      vitalSigns: vitalSignsInput.value,
      notes: reportForm.value.notes,
      followUpDate: reportForm.value.followUpDate,
      doctor: doctorId.value
    }

    await axios.post('http://localhost:3000/medical-reports', reportData, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    resetForm()
    closeModal()
    await fetchMedicalReports()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Medical report created successfully',
      life: 3000
    })
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create medical report'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Any additional styles that need to be scoped can go here */
</style>