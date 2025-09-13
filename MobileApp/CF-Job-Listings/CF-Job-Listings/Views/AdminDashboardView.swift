import SwiftUI

struct AdminDashboardView: View {
	@StateObject private var vm = JobListViewModel()
	@State private var contractsSummary: String = ""

	var body: some View {
		NavigationStack {
			List {
				Section("Jobs") {
					ForEach(vm.allJobs, id: \.self) { job in
						VStack(alignment: .leading, spacing: 4) {
							Text(job.displayTitle).font(.headline)
							Text(job.location ?? "").font(.subheadline).foregroundColor(.secondary)
						}
					}
				}
				Section("Contracts API (summary)") {
					Text(contractsSummary.isEmpty ? "No data" : contractsSummary)
						.font(.footnote)
				}
			}
			.navigationTitle("Admin (Read-Only)")
		}
		.task {
			await vm.load()
			await loadContractsSummary()
		}
	}

	private func loadContractsSummary() async {
		let url = AppConfig.shared.apiBaseURL.appendingPathComponent("api/contracts/health")
		var req = URLRequest(url: url)
		req.httpMethod = "GET"
		if let (data, resp) = try? await URLSession.shared.data(for: req), let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode) {
			contractsSummary = String(data: data, encoding: .utf8) ?? ""
		}
	}
}


