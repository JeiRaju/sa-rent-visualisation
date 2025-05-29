# Load required libraries
library(readxl)
library(dplyr)
library(jsonlite)
library(stringr)

# Define a function to extract suburb and total median rent per file
read_rent_data <- function(file_path, quarter_label) {
  df <- read_excel(file_path, sheet = "Suburb", skip = 11)

  # Rename columns safely
  colnames(df)[1] <- "Suburb"
  
  # Clean and select relevant columns: Suburb + Total Median
  df_clean <- df %>% filter(!is.na(Suburb), !Suburb %in% c("Metro", "Country")) %>% 
  select(Suburb, `Total Median` = ncol(.)) %>%  # total median is the last column 
    mutate(
      Suburb = str_to_title(str_trim(Suburb)),
      MedianRent = as.numeric(`Total Median`),
      Quarter = quarter_label
    ) %>%
    filter(!is.na(MedianRent)) %>%
    select(Suburb, MedianRent, Quarter)

  return(df_clean)
}

# File paths and labels
file_quarters <- list(
  "data/private-rental-report-2024-03.xlsx" = "Q1-2024",
  "data/private-rental-report-2024-06.xlsx" = "Q2-2024",
  "data/private-rental-report-2024-09.xlsx" = "Q3-2024",
  "data/private-rental-report-2024-12.xlsx" = "Q4-2024"
)

# Process all files
combined_data <- bind_rows(lapply(names(file_quarters), function(file) {
  read_rent_data(file, file_quarters[[file]])
}))

# Export to JSON
write_json(combined_data, "rental_data_2024.json", pretty = TRUE)

cat("✅ Exported rental_data_2024.json with", nrow(combined_data), "records.\n")