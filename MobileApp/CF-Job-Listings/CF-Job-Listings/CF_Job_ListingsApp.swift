//
//  CF_Job_ListingsApp.swift
//  CF-Job-Listings
//
//  Created by Cody Cochran on 9/13/25.
//

import SwiftUI
import os.log

@main
struct CF_Job_ListingsApp: App {
	@UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
	init() {}

	var body: some Scene {
		WindowGroup { ContentView() }
	}
}
