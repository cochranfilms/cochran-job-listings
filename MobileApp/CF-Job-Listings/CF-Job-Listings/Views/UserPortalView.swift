import SwiftUI

struct UserPortalView: View {
	@State private var name: String = ""
	@State private var email: String = ""
	@State private var record: UserRecord?
	@State private var notifications: [NotificationItem] = []
	@State private var isLoading = false
	@State private var errorMessage: String?

	var body: some View {
		NavigationStack {
			ScrollView {
				VStack(spacing: 16) {
					Text("Creator Portal").cfHeaderStyle()
					CFCard {
						VStack(spacing: 12) {
							TextField("Full Name", text: $name)
							TextField("Email", text: $email)
								.keyboardType(.emailAddress)
							HStack {
								Button("Load Portal", action: load)
									.buttonStyle(CFPrimaryButtonStyle())
							}
							if let errorMessage { Text(errorMessage).foregroundColor(CFTheme.error) }
						}
					}

					if let rec = record {
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

	private func load() {
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


