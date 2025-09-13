//
//  CF_Job_ListingsApp.swift
//  CF-Job-Listings
//
//  Created by Cody Cochran on 9/13/25.
//

import SwiftUI
#if canImport(FirebaseCore)
import FirebaseCore
#endif

@main
struct CF_Job_ListingsApp: App {
	init() {
		#if canImport(FirebaseCore)
		if FirebaseApp.app() == nil {
			let cfg = AppConfig.shared
			let options = FirebaseOptions(googleAppID: cfg.firebaseAppId ?? "", gcmSenderID: cfg.firebaseSenderId ?? "")
			options.apiKey = cfg.firebaseAPIKey ?? ""
			options.projectID = cfg.firebaseProjectId ?? ""
			options.storageBucket = cfg.firebaseStorageBucket ?? ""
			FirebaseApp.configure(options: options)
		}
		#endif
	}

	var body: some Scene {
		WindowGroup { ContentView() }
	}
}
