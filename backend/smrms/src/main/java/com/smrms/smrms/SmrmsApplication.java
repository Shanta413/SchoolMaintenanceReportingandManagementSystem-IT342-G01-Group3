package com.smrms.smrms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmrmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmrmsApplication.class, args);

		// Display message after successful startup
		System.out.println("\n✅ Application started successfully!");
		System.out.println("----------------------------------------------------");
		System.out.println("----------------------------------------------------\n");


	}

}
