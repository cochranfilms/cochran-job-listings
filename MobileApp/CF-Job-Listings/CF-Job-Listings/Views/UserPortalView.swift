import SwiftUI

struct UserPortalView: View {
	@StateObject private var auth = AuthService.shared
	@State private var email: String = ""
	@State private var password: String = ""
	@State private var record: UserRecord?
	@State private var notifications: [NotificationItem] = []
	@State private var isLoading = false
	@State private var errorMessage: String?
	@State private var contractFiles: [StorageService.ContractFile] = []
	@StateObject private var vm = PortalViewModel()
	@State private var showEditProfile = false
	@State private var editLocation = ""
	@State private var editRole = ""

	var body: some View {
		NavigationStack {
			ZStack(alignment: .top) {
				CFTheme.background.ignoresSafeArea()
				ScrollView {
					VStack(spacing: 16) {
						Text("Creator Portal").cfHeaderStyle()
						if !auth.isAuthenticated {
							CFCard {
								VStack(spacing: 12) {
									TextField("Email", text: $email).keyboardType(.emailAddress).textContentType(.username)
									SecureField("Password", text: $password).textContentType(.password)
									Button("Sign In") { signIn() }.buttonStyle(CFPrimaryButtonStyle())
									Button("Forgot Password?") { Task { try? await auth.resetPassword(email: email) } }
										.font(.footnote)
										.foregroundColor(.white)
									if let errorMessage { Text(errorMessage).foregroundColor(CFTheme.error) }
								}
							}
						}

						if auth.isAuthenticated, record == nil {
							ProgressView("Loading your portal...")
						}

						if auth.isAuthenticated, let rec = record {
							CFCard {
								VStack(alignment: .leading, spacing: 8) {
									Text("Profile").cfSectionHeader()
									Label(rec.name ?? "", systemImage: "person")
									Label(rec.profile?.email ?? "", systemImage: "envelope")
									Label(rec.profile?.location ?? "", systemImage: "mappin.and.ellipse")
									Button("Edit Profile") {
										editLocation = rec.profile?.location ?? ""
										editRole = rec.profile?.role ?? ""
										showEditProfile = true
									}
									.buttonStyle(CFPrimaryButtonStyle())
								}
							}

							CFCard {
								VStack(alignment: .leading, spacing: 8) {
									Text("Jobs").cfSectionHeader()
									if let jobs = rec.jobs, !jobs.isEmpty {
										ForEach(jobs.keys.sorted(), id: \.self) { key in
											if let job = rec.jobs?[key] {
												VStack(alignment: .leading, spacing: 6) {
													Text(job.title ?? job.jobTitle ?? "Assigned Role").font(.headline)
													Label(job.location ?? "", systemImage: "mappin.and.ellipse")
													Label(job.date ?? "", systemImage: "calendar")
													if let pay = (job.pay ?? job.rate), !pay.isEmpty { Label(pay, systemImage: "dollarsign.circle") }
													HStack {
														Button("Accept") { Task { await vm.acceptJob(key) } }
															.buttonStyle(CFPrimaryButtonStyle())
														Button("Decline") { Task { await vm.declineJob(key) } }
													}
												}
												.padding(.vertical, 6)
												Divider()
											}
										}
									} else {
										Text("No jobs assigned yet.").foregroundColor(.secondary)
									}
								}
							}

							CFCard {
								VStack(alignment: .leading, spacing: 8) {
									Text("Contracts").cfSectionHeader()
									if contractFiles.isEmpty {
										Text("No contracts found.").foregroundColor(.secondary)
									} else {
										ForEach(contractFiles, id: \.id) { f in
											Link(f.name, destination: f.url)
											Divider()
										}
									}
								}
							}

							CFCard {
								VStack(alignment: .leading, spacing: 8) {
									Text("Notifications").cfSectionHeader()
									ForEach(notifications) { n in
										VStack(alignment: .leading, spacing: 4) {
											Text(n.title).font(.headline)
											Text(n.message).font(.subheadline)
											Text(n.timestamp).font(.caption).foregroundColor(.secondary)
										}
										.padding(.vertical, 6)
										Divider()
									}
									if notifications.isEmpty { Text("No notifications.").foregroundColor(.secondary) }
								}
							}
						}
					}
					.padding()
				}
			}
			.navigationTitle("Portal")
			.toolbar {
				ToolbarItem(placement: .navigationBarTrailing) {
					if auth.isAuthenticated { Button("Logout") { Task { await vm.logout() } } }
				}
			}
		}
		.sheet(isPresented: $showEditProfile) {
			NavigationStack {
				Form {
					Section("Profile") {
						TextField("Location", text: $editLocation)
						TextField("Role", text: $editRole)
					}
				}
				.navigationTitle("Edit Profile")
				.toolbar {
					ToolbarItem(placement: .cancellationAction) { Button("Cancel") { showEditProfile = false } }
					ToolbarItem(placement: .confirmationAction) { Button("Save") { Task { await vm.updateProfile(location: editLocation, role: editRole); showEditProfile = false } } }
				}
			}
		}
	}

	private func signIn() {
		Task {
			guard !email.isEmpty, !password.isEmpty else { errorMessage = "Enter email and password"; return }
			isLoading = true
			errorMessage = nil
			defer { isLoading = false }
			do {
				try await auth.signIn(email: email, password: password)
				// Start listeners and load data
				await vm.start(email: email)
				UserService.shared.listenUser(byEmail: email) { rec in
					Task { @MainActor in self.record = rec }
				}
				if let initial = try? await UserService.shared.fetchUser(byEmail: email) { self.record = initial }
				self.notifications = (try? await UserService.shared.fetchNotifications()) ?? []
				if let files = try? await StorageService.shared.listContracts(ownerEmail: email) {
					self.contractFiles = files
				}
			} catch {
				errorMessage = (error as NSError).localizedDescription
			}
		}
	}
}


