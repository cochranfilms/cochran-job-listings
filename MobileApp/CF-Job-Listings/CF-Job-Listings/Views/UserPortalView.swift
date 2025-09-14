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

	var body: some View {
		NavigationStack {
			ScrollView {
				VStack(spacing: 16) {
					Text("Creator Portal").cfHeaderStyle()
					if !auth.isAuthenticated {
						CFCard {
							VStack(spacing: 12) {
								TextField("Email", text: $email).keyboardType(.emailAddress).textContentType(.username)
								SecureField("Password", text: $password).textContentType(.password)
								Button("Sign In") { signIn() }.buttonStyle(CFPrimaryButtonStyle())
								if let errorMessage { Text(errorMessage).foregroundColor(CFTheme.error) }
							}
						}
					}

					if auth.isAuthenticated, let rec = record {
						CFCard {
							VStack(alignment: .leading, spacing: 8) {
								Text("Profile").cfSectionHeader()
								Label(rec.name ?? "", systemImage: "person")
								Label(rec.profile?.email ?? "", systemImage: "envelope")
								Label(rec.profile?.location ?? "", systemImage: "mappin.and.ellipse")
							}
						}

						CFCard {
							VStack(alignment: .leading, spacing: 8) {
								Text("Jobs").cfSectionHeader()
								if let jobs = rec.jobs, !jobs.isEmpty {
									ForEach(jobs.keys.sorted(), id: \.self) { key in
										if let job = rec.jobs?[key] {
											VStack(alignment: .leading, spacing: 4) {
												Text(job.title ?? job.jobTitle ?? "Assigned Role").font(.headline)
												Label(job.location ?? "", systemImage: "mappin.and.ellipse")
												Label(job.date ?? "", systemImage: "calendar")
												if let pay = (job.pay ?? job.rate), !pay.isEmpty { Label(pay, systemImage: "dollarsign.circle") }
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
			.cfDarkScreen()
			.navigationTitle("Portal")
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
				// Start listeners
				UserService.shared.listenUser(byEmail: email) { rec in
					Task { @MainActor in self.record = rec }
				}
				self.notifications = (try? await UserService.shared.fetchNotifications()) ?? []
			} catch {
				errorMessage = (error as NSError).localizedDescription
			}
		}
	}
		Task {
			isLoading = true
			errorMessage = nil
			defer { isLoading = false }
			do {
				guard !name.isEmpty, !email.isEmpty else { throw NSError(domain: "Portal", code: 1, userInfo: [NSLocalizedDescriptionKey: "Enter name and email"]) }
				if let rec = try await UserService.shared.fetchUser(byName: name), (rec.profile?.email ?? "").lowercased() == email.lowercased() {
					self.record = rec
					self.notifications = (try? await UserService.shared.fetchNotifications()) ?? []
				} else {
					throw NSError(domain: "Portal", code: 2, userInfo: [NSLocalizedDescriptionKey: "No matching user found"])
				}
			} catch {
				errorMessage = (error as NSError).localizedDescription
				record = nil
				notifications = []
			}
		}
	}
}


